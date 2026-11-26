import { useCallback, useEffect, useRef, useState } from "react";
import useSendSdp from "@services/room/hooks/useSendSdp";
import type {
  AdminAction,
  ChatMessage,
  Participant,
  ServerMessage,
} from "@services/room/interfaces/participants.type";
import { decodeSdp, encodeSdp } from "@helpers/sdp";
import { wsUrl } from "@helpers/ws";
import { iceServersNow, loadIceServers } from "@helpers/ice";
import {
  CAPTURE_VIDEO,
  DEFAULT_VIDEO_QUALITY,
  VIDEO_QUALITIES,
  type VideoQualityId,
} from "@constants/videoQuality";

interface Options {
  meetingId: string;
  userId: string;
  /** Pengamat (admin): hanya menonton, tidak terdaftar sebagai peserta & tidak publish. */
  observer?: boolean;
  /** Pengaturan dari layar pre-join (kamera/mic awal & perangkat pilihan). */
  initialMedia?: {
    camera: boolean;
    mic: boolean;
    videoDeviceId?: string;
    audioDeviceId?: string;
    videoQuality?: VideoQualityId;
  };
  /** Perintah admin untuk peserta ini. */
  onCommand?: (action: "mute_mic" | "camera_off" | "kick") => void;
}

export type PeerStatus = "connecting" | "connected" | "reconnecting";

export interface RemotePeer {
  stream: MediaStream | null;
  status: PeerStatus;
}

const ICE_GATHER_TIMEOUT_MS = 4000;
const DISCONNECT_GRACE_MS = 5000;
const LABEL_DELAY_MS = 3000;
const MAX_RETRIES = 6;
const MAX_SOCKET_FAILS = 3; // gagal tersambung berturut-turut → anggap ditolak/server mati

const backoff = (n: number) => Math.min(1000 * 2 ** n, 10000);

interface Sub {
  pc: RTCPeerConnection | null;
  retries: number;
  timer: ReturnType<typeof setTimeout> | null;
  closed: boolean;
}

/** Track pengganti agar koneksi publish tetap hidup saat kamera/mic mati (tanpa renegosiasi). */
function createPlaceholders() {
  const canvas = document.createElement("canvas");
  canvas.width = 160;
  canvas.height = 90;
  const ctx2d = canvas.getContext("2d");
  const paint = () => {
    if (!ctx2d) return;
    ctx2d.fillStyle = "#000";
    ctx2d.fillRect(0, 0, canvas.width, canvas.height);
  };
  paint();
  const video = canvas.captureStream(2).getVideoTracks()[0];
  const interval = setInterval(paint, 500);

  const audioCtx = new AudioContext();
  const dest = audioCtx.createMediaStreamDestination();
  const audio = dest.stream.getAudioTracks()[0];

  return {
    video,
    audio,
    dispose: () => {
      clearInterval(interval);
      video.stop();
      audio.stop();
      void audioCtx.close();
    },
  };
}

/**
 * Konferensi: presence via websocket (join = buka socket), publish kamera/mic (bisa
 * dinyalakan/dimatikan terpisah), dan subscribe otomatis ke semua peserta yang media-nya aktif.
 */
export default function useConference({
  meetingId,
  userId,
  observer = false,
  initialMedia,
  onCommand,
}: Options) {
  const sendSdp = useSendSdp();
  const sendSdpRef = useRef(sendSdp);
  sendSdpRef.current = sendSdp;
  const onCommandRef = useRef(onCommand);
  onCommandRef.current = onCommand;
  const initialRef = useRef(initialMedia);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [socketUp, setSocketUp] = useState(false);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [socketFailed, setSocketFailed] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [micOn, setMicOn] = useState(false);
  const [cameraCount, setCameraCount] = useState(0);
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [busy, setBusy] = useState(false);
  const [videoQuality, setVideoQualityState] = useState<VideoQualityId>(
    initialMedia?.videoQuality ?? DEFAULT_VIDEO_QUALITY,
  );
  const qualityRef = useRef(videoQuality);
  const [publishStatus, setPublishStatus] = useState<PeerStatus | null>(null);
  const [remote, setRemote] = useState<Record<string, RemotePeer>>({});
  const [error, setError] = useState<string | null>(null);

  const alive = useRef(true);
  const ws = useRef<WebSocket | null>(null);
  const placeholders = useRef<ReturnType<typeof createPlaceholders> | null>(
    null,
  );
  const camTrack = useRef<MediaStreamTrack | null>(null);
  const micTrack = useRef<MediaStreamTrack | null>(null);
  const pubPc = useRef<RTCPeerConnection | null>(null);
  const videoSender = useRef<RTCRtpSender | null>(null);
  const audioSender = useRef<RTCRtpSender | null>(null);
  const pubTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pubRetries = useRef(0);
  const subs = useRef<Map<string, Sub>>(new Map());
  const deviceIds = useRef({
    video: initialMedia?.videoDeviceId,
    audio: initialMedia?.audioDeviceId,
  });
  const setCameraRef = useRef<(on: boolean) => Promise<void>>(async () => {});
  const setMicRef = useRef<(on: boolean) => Promise<void>>(async () => {});

  // iceServersNow() sudah terisi (di-prefetch) sebelum newPc dipanggil
  const newPc = () =>
    new RTCPeerConnection({ iceServers: iceServersNow() ?? [] });

  /** Batasi bitrate/resolusi/fps video kiriman sesuai preset (aman dipanggil kapan saja). */
  const applyQuality = useCallback(async () => {
    const sender = videoSender.current;
    if (!sender) return;
    const q = VIDEO_QUALITIES[qualityRef.current];
    try {
      const params = sender.getParameters();
      if (!params.encodings?.length) params.encodings = [{}];
      const h = sender.track?.getSettings().height;
      params.encodings[0].maxBitrate = q.maxBitrate;
      params.encodings[0].maxFramerate = q.maxFramerate;
      params.encodings[0].scaleResolutionDownBy = h
        ? Math.max(1, h / q.height)
        : 1;
      await sender.setParameters(params);
    } catch (e) {
      console.warn("[conference] apply video quality failed", e);
    }
  }, []);

  const setVideoQuality = useCallback(
    (id: VideoQualityId) => {
      qualityRef.current = id;
      setVideoQualityState(id);
      void applyQuality();
    },
    [applyQuality],
  );

  const negotiate = useCallback(
    async (pc: RTCPeerConnection, peerId: string, isSender: boolean) => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      // signaling non-trickle: tunggu ICE gathering selesai (dengan timeout agar tidak menggantung)
      await new Promise<void>((resolve) => {
        if (pc.iceGatheringState === "complete") return resolve();
        const done = () => {
          clearTimeout(t);
          pc.removeEventListener("icegatheringstatechange", onChange);
          resolve();
        };
        const onChange = () => pc.iceGatheringState === "complete" && done();
        const t = setTimeout(done, ICE_GATHER_TIMEOUT_MS);
        pc.addEventListener("icegatheringstatechange", onChange);
      });
      const { response, error } = await sendSdpRef.current(
        { meetingId, userId, peerId, isSender },
        encodeSdp(pc.localDescription),
      );
      if (error || !response) throw new Error(error ?? "Signaling failed");
      await pc.setRemoteDescription(decodeSdp(response.Sdp));
    },
    [meetingId, userId],
  );

  /* ---------------- presence (websocket) ---------------- */

  const reportMedia = useCallback(() => {
    const sock = ws.current;
    if (sock?.readyState !== WebSocket.OPEN) return;
    sock.send(
      JSON.stringify({
        type: "media",
        camera: !!camTrack.current,
        mic: !!micTrack.current,
      }),
    );
  }, []);

  const sendJson = useCallback((payload: object) => {
    const sock = ws.current;
    if (sock?.readyState === WebSocket.OPEN) sock.send(JSON.stringify(payload));
  }, []);
  const sendChat = useCallback(
    (text: string) => sendJson({ type: "chat", text }),
    [sendJson],
  );
  /** Khusus observer (admin): kendalikan peserta. */
  const sendAdmin = useCallback(
    (action: AdminAction, target: string) =>
      sendJson({ type: "admin", action, target }),
    [sendJson],
  );

  /* ---------------- publish ---------------- */

  const closePublisher = useCallback(() => {
    if (pubTimer.current) clearTimeout(pubTimer.current);
    pubTimer.current = null;
    pubPc.current?.close();
    pubPc.current = null;
    videoSender.current = null;
    audioSender.current = null;
  }, []);

  const startPublisher = useCallback(async () => {
    if (!iceServersNow()) {
      await loadIceServers();
      if (!alive.current) return;
    }
    closePublisher();
    placeholders.current ??= createPlaceholders();
    const ph = placeholders.current;
    const pc = newPc();
    pubPc.current = pc;
    setPublishStatus(pubRetries.current > 0 ? "reconnecting" : "connecting");

    const stream = new MediaStream();
    videoSender.current = pc.addTransceiver(camTrack.current ?? ph.video, {
      direction: "sendonly",
      streams: [stream],
    }).sender;
    audioSender.current = pc.addTransceiver(micTrack.current ?? ph.audio, {
      direction: "sendonly",
      streams: [stream],
    }).sender;

    const retry = () => {
      if (!alive.current || pubPc.current !== pc) return;
      if (pubRetries.current >= MAX_RETRIES) {
        setError("Media connection lost. Reload the page to rejoin.");
        setPublishStatus(null);
        return;
      }
      setPublishStatus("reconnecting");
      pubTimer.current = setTimeout(
        () => void startPublisher(),
        backoff(pubRetries.current++),
      );
      pc.close();
    };

    pc.onconnectionstatechange = () => {
      if (pubPc.current !== pc) return;
      const st = pc.connectionState;
      if (st === "connected") {
        pubRetries.current = 0;
        setPublishStatus("connected");
      } else if (st === "failed") {
        console.warn("[conference] publish: connection failed");
        retry();
      } else if (st === "disconnected") {
        console.warn("[conference] publish: connection disconnected");
        setTimeout(
          () => pc.connectionState === "disconnected" && retry(),
          DISCONNECT_GRACE_MS,
        );
      }
    };

    try {
      await negotiate(pc, "", true);
      await applyQuality();
    } catch (e) {
      console.warn("[conference] publish: signaling failed", e);
      if (pubPc.current !== pc) return;
      setError(e instanceof Error ? e.message : "Failed to publish");
      retry();
    }
  }, [closePublisher, negotiate, applyQuality]);

  const stopTrack = (ref: { current: MediaStreamTrack | null }) => {
    ref.current?.stop();
    ref.current = null;
  };

  const setCamera = useCallback(
    async (on: boolean) => {
      if (on) {
        const gm = await navigator.mediaDevices.getUserMedia({
          video: {
            ...CAPTURE_VIDEO,
            ...(deviceIds.current.video
              ? { deviceId: { exact: deviceIds.current.video } }
              : {}),
          },
        });
        const track = gm.getVideoTracks()[0];
        track.onended = () => void setCamera(false);
        camTrack.current = track;
        setFacing(
          track.getSettings().facingMode === "environment"
            ? "environment"
            : "user",
        );
        await videoSender.current?.replaceTrack(track);
        await applyQuality();
        setLocalStream(new MediaStream([track]));
      } else {
        stopTrack(camTrack);
        await videoSender.current?.replaceTrack(
          placeholders.current?.video ?? null,
        );
        setLocalStream(null);
      }
      reportMedia();
    },
    [reportMedia, applyQuality],
  );

  /** Ganti kamera (depan/belakang di ponsel; kamera berikutnya di desktop). */
  const switchCamera = useCallback(async () => {
    const old = camTrack.current;
    if (!old) return;
    const oldSettings = old.getSettings();
    const videoInputs = (
      await navigator.mediaDevices.enumerateDevices()
    ).filter((d) => d.kind === "videoinput");
    if (videoInputs.length < 2) return;

    // kandidat: balik facingMode (ponsel), lalu kamera berikutnya berdasarkan deviceId
    const idx = videoInputs.findIndex(
      (d) => d.deviceId === oldSettings.deviceId,
    );
    const next = videoInputs[(idx + 1) % videoInputs.length];
    const candidates: MediaTrackConstraints[] = [];
    if (oldSettings.facingMode) {
      candidates.push({
        facingMode: {
          exact: oldSettings.facingMode === "user" ? "environment" : "user",
        },
      });
    }
    candidates.push({ deviceId: { exact: next.deviceId } });

    // beberapa perangkat (iOS/Android) hanya mau membuka kamera baru setelah yang lama dilepas
    old.onended = null;
    old.stop();
    let track: MediaStreamTrack | null = null;
    for (const video of candidates) {
      try {
        track = (
          await navigator.mediaDevices.getUserMedia({
            video: { ...CAPTURE_VIDEO, ...video },
          })
        ).getVideoTracks()[0];
        break;
      } catch {
        /* coba kandidat berikutnya */
      }
    }
    if (!track) {
      // gagal total: pulihkan kamera sebelumnya agar video tidak mati
      track = (
        await navigator.mediaDevices.getUserMedia({
          video: oldSettings.deviceId
            ? { deviceId: { exact: oldSettings.deviceId } }
            : true,
        })
      ).getVideoTracks()[0];
    }
    track.onended = () => void setCameraRef.current(false);
    camTrack.current = track;
    const settings = track.getSettings();
    if (settings.deviceId) deviceIds.current.video = settings.deviceId;
    setFacing(settings.facingMode === "environment" ? "environment" : "user");
    await videoSender.current?.replaceTrack(track);
    await applyQuality();
    setLocalStream(new MediaStream([track]));
  }, [applyQuality]);

  const setMic = useCallback(
    async (on: boolean) => {
      if (on) {
        const gm = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            ...(deviceIds.current.audio
              ? { deviceId: { exact: deviceIds.current.audio } }
              : {}),
          },
        });
        const track = gm.getAudioTracks()[0];
        track.onended = () => void setMic(false);
        micTrack.current = track;
        await audioSender.current?.replaceTrack(track);
        setMicOn(true);
      } else {
        stopTrack(micTrack);
        await audioSender.current?.replaceTrack(
          placeholders.current?.audio ?? null,
        );
        setMicOn(false);
      }
      reportMedia();
    },
    [reportMedia],
  );

  setCameraRef.current = setCamera;
  setMicRef.current = setMic;

  const guarded = useCallback(
    async (fn: () => Promise<void>) => {
      if (busy) return;
      setBusy(true);
      try {
        setError(null);
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error(
            "Camera/microphone unavailable. Open via http://localhost or HTTPS (npm run dev:https).",
          );
        }
        await fn();
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Could not access your device",
        );
      } finally {
        setBusy(false);
      }
    },
    [busy],
  );

  const flipCamera = useCallback(
    () => guarded(switchCamera),
    [guarded, switchCamera],
  );

  // jumlah kamera tersedia (tombol ganti kamera hanya tampil jika > 1)
  useEffect(() => {
    if (observer) return;
    const refresh = () =>
      navigator.mediaDevices
        ?.enumerateDevices()
        .then((d) =>
          setCameraCount(d.filter((x) => x.kind === "videoinput").length),
        )
        .catch(() => {});
    void refresh();
    navigator.mediaDevices?.addEventListener?.("devicechange", refresh);
    return () =>
      navigator.mediaDevices?.removeEventListener?.("devicechange", refresh);
  }, [observer, localStream]);

  const toggleCamera = useCallback(
    () => guarded(() => setCamera(!camTrack.current)),
    [guarded, setCamera],
  );
  const toggleMic = useCallback(
    () => guarded(() => setMic(!micTrack.current)),
    [guarded, setMic],
  );

  /* ---------------- subscribe ---------------- */

  const patchRemote = (peerId: string, patch: Partial<RemotePeer>) =>
    setRemote((r) =>
      r[peerId] ? { ...r, [peerId]: { ...r[peerId], ...patch } } : r,
    );

  const connectSub = useCallback(
    async (peerId: string, sub: Sub) => {
      if (!iceServersNow()) {
        await loadIceServers();
        if (sub.closed) return;
      }
      sub.pc?.close();
      const pc = newPc();
      sub.pc = pc;
      pc.addTransceiver("video", { direction: "recvonly" });
      pc.addTransceiver("audio", { direction: "recvonly" });
      const stream = new MediaStream();
      pc.ontrack = (ev) => {
        stream.addTrack(ev.track);
        patchRemote(peerId, { stream });
      };

      const retry = () => {
        if (sub.closed || sub.pc !== pc) return;
        pc.close();
        if (sub.retries >= MAX_RETRIES) return; // dicoba lagi oleh update presence berikutnya
        patchRemote(peerId, { status: "reconnecting" });
        sub.timer = setTimeout(() => {
          if (!sub.closed) void connectSub(peerId, sub);
        }, backoff(sub.retries++));
      };

      pc.onconnectionstatechange = () => {
        if (sub.closed || sub.pc !== pc) return;
        const st = pc.connectionState;
        if (st === "connected") {
          sub.retries = 0;
          patchRemote(peerId, { status: "connected" });
        } else if (st === "failed") {
          console.warn(`[conference] subscribe ${peerId}: connection ${st}`);
          retry();
        } else if (st === "disconnected") {
          console.warn(`[conference] subscribe ${peerId}: connection ${st}`);
          // label "menyambung ulang" hanya jika gangguan bertahan, bukan kedipan sesaat
          setTimeout(
            () =>
              pc.connectionState === "disconnected" &&
              patchRemote(peerId, { status: "reconnecting" }),
            LABEL_DELAY_MS,
          );
          setTimeout(
            () => pc.connectionState === "disconnected" && retry(),
            DISCONNECT_GRACE_MS,
          );
        }
      };

      try {
        await negotiate(pc, peerId, false);
      } catch (e) {
        console.warn(`[conference] subscribe ${peerId}: signaling failed`, e);
        retry();
      }
    },
    [negotiate],
  );

  const unsubscribe = useCallback((peerId: string) => {
    const sub = subs.current.get(peerId);
    if (!sub) return;
    sub.closed = true;
    if (sub.timer) clearTimeout(sub.timer);
    sub.pc?.close();
    subs.current.delete(peerId);
    setRemote((r) => {
      const { [peerId]: _, ...rest } = r;
      return rest;
    });
  }, []);

  const subscribe = useCallback(
    (peerId: string) => {
      if (!peerId || peerId === userId) return;
      const existing = subs.current.get(peerId);
      // sub yang sudah menyerah (retry habis) boleh dicoba lagi
      if (
        existing &&
        !(
          existing.retries >= MAX_RETRIES &&
          existing.pc?.connectionState !== "connected"
        )
      )
        return;
      if (existing) unsubscribe(peerId);
      const sub: Sub = { pc: null, retries: 0, timer: null, closed: false };
      subs.current.set(peerId, sub);
      setRemote((r) => ({
        ...r,
        [peerId]: { stream: null, status: "connecting" },
      }));
      void connectSub(peerId, sub);
    },
    [userId, connectSub, unsubscribe],
  );

  const syncPeers = useCallback(
    (list: Participant[]) => {
      const wanted = new Set(
        list
          .filter((p) => p.publishing && p.userId !== userId)
          .map((p) => p.userId),
      );
      wanted.forEach(subscribe);
      [...subs.current.keys()]
        .filter((id) => !wanted.has(id))
        .forEach(unsubscribe);
    },
    [userId, subscribe, unsubscribe],
  );
  const syncPeersRef = useRef(syncPeers);
  syncPeersRef.current = syncPeers;

  /* ---------------- lifecycle ---------------- */

  // websocket presence + reconnect
  useEffect(() => {
    alive.current = true;
    let retries = 0;
    let fails = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      const sock = new WebSocket(
        wsUrl(`/ws/m/${encodeURIComponent(meetingId)}`, {
          userId,
          observer: String(observer),
        }),
      );
      ws.current = sock;
      let opened = false;
      sock.onopen = () => {
        opened = true;
        retries = 0;
        fails = 0;
        setSocketFailed(false);
        setSocketUp(true);
        reportMedia();
      };
      sock.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data) as ServerMessage;
          switch (msg.type) {
            case "state":
              setParticipants(msg.participants);
              setBlocked(msg.blocked ?? []);
              syncPeersRef.current(msg.participants);
              break;
            case "history":
              setMessages(msg.messages);
              break;
            case "chat":
              setMessages((m) =>
                m.some((x) => x.id === msg.id) ? m : [...m, msg].slice(-200),
              );
              break;
            case "command":
              if (msg.action === "mute_mic") void setMicRef.current(false);
              if (msg.action === "camera_off") void setCameraRef.current(false);
              onCommandRef.current?.(msg.action);
              break;
          }
        } catch {
          /* abaikan pesan tak dikenal */
        }
      };
      sock.onclose = () => {
        if (ws.current === sock) setSocketUp(false);
        if (!alive.current || ws.current !== sock) return;
        if (!opened && ++fails >= MAX_SOCKET_FAILS) setSocketFailed(true);
        timer = setTimeout(connect, backoff(retries++));
      };
      sock.onerror = () => sock.close();
    };
    connect();

    return () => {
      alive.current = false;
      if (timer) clearTimeout(timer);
      const sock = ws.current;
      ws.current = null;
      sock?.close();
    };
  }, [meetingId, userId, observer, reportMedia]);

  // publish langsung saat join (media pengganti dulu; kamera/mic menyusul via replaceTrack)
  useEffect(() => {
    if (observer) return;
    void startPublisher();
    const init = initialRef.current;
    if (init?.mic) void setMicRef.current(true).catch(() => {});
    if (init?.camera) void setCameraRef.current(true).catch(() => {});
    return () => {
      closePublisher();
      stopTrack(camTrack);
      stopTrack(micTrack);
      placeholders.current?.dispose();
      placeholders.current = null;
    };
  }, [observer, startPublisher, closePublisher]);

  useEffect(() => {
    const subMap = subs.current;
    return () => {
      subMap.forEach((s) => {
        s.closed = true;
        if (s.timer) clearTimeout(s.timer);
        s.pc?.close();
      });
      subMap.clear();
    };
  }, []);

  // jaringan kembali: coba ulang yang sudah menyerah
  useEffect(() => {
    const onOnline = () => {
      subs.current.forEach((s, id) => {
        if (s.retries >= MAX_RETRIES) subscribe(id);
      });
      if (!observer && !pubPc.current) {
        pubRetries.current = 0;
        void startPublisher();
      }
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [subscribe, startPublisher, observer]);

  return {
    participants,
    blocked,
    messages,
    socketUp,
    socketFailed,
    sendChat,
    sendAdmin,
    localStream,
    cameraOn: !!localStream,
    micOn,
    busy,
    publishStatus,
    remote,
    error,
    toggleCamera,
    toggleMic,
    flipCamera,
    cameraCount,
    facing,
    videoQuality,
    setVideoQuality,
  };
}
