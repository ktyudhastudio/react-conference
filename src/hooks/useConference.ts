import { useCallback, useEffect, useRef, useState } from "react";
import useSendSdp from "@services/room/hooks/useSendSdp";
import { decodeSdp, encodeSdp } from "@helpers/sdp";
import { STUN_SERVERS } from "@constants/stun";

interface Options {
  meetingId: string;
  userId: string;
}

/** Publish kamera sendiri (sender) dan subscribe ke peer (receiver) via go-conference. */
export default function useConference({ meetingId, userId }: Options) {
  const sendSdp = useSendSdp();
  const pcs = useRef<RTCPeerConnection[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remote, setRemote] = useState<Record<string, MediaStream>>({});
  const [error, setError] = useState<string | null>(null);

  const negotiate = useCallback(
    async (pc: RTCPeerConnection, peerId: string, isSender: boolean) => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      // signaling non-trickle: tunggu ICE gathering selesai
      await new Promise<void>((resolve) => {
        if (pc.iceGatheringState === "complete") return resolve();
        pc.onicegatheringstatechange = () =>
          pc.iceGatheringState === "complete" && resolve();
      });
      const { response, error } = await sendSdp(
        { meetingId, userId, peerId, isSender },
        encodeSdp(pc.localDescription),
      );
      if (error || !response) throw new Error(error ?? "Gagal signaling");
      await pc.setRemoteDescription(decodeSdp(response.Sdp));
    },
    [meetingId, userId, sendSdp],
  );

  const publish = useCallback(async () => {
    try {
      setError(null);
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Kamera tidak tersedia. Buka lewat http://localhost atau HTTPS (npm run dev:https).",
        );
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setLocalStream(stream);
      const pc = new RTCPeerConnection({ iceServers: [{ urls: [...STUN_SERVERS] }] });
      pcs.current.push(pc);
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      await negotiate(pc, "", true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal publish");
    }
  }, [negotiate]);

  const subscribe = useCallback(
    async (peerId: string) => {
      try {
        setError(null);
        const pc = new RTCPeerConnection({ iceServers: [{ urls: [...STUN_SERVERS] }] });
        pcs.current.push(pc);
        pc.addTransceiver("video", { direction: "recvonly" });
        pc.ontrack = (ev) =>
          setRemote((r) => ({ ...r, [peerId]: ev.streams[0] ?? new MediaStream([ev.track]) }));
        await negotiate(pc, peerId, false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Gagal subscribe");
      }
    },
    [negotiate],
  );

  useEffect(() => {
    const list = pcs.current;
    return () => list.forEach((pc) => pc.close());
  }, []);

  return { localStream, remote, error, publish, subscribe };
}
