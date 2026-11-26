import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MicIcon, MicOffIcon, VideoIcon, VideoOffIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SheetSelect from "@components/common/SheetSelect";
import VideoTile from "@components/common/VideoTile";
import useGlobalStore from "@store/useStore";
import { randomId } from "@helpers/id";
import {
  VIDEO_QUALITY_OPTIONS,
  type VideoQualityId,
} from "@constants/videoQuality";

interface Props {
  meetingId: string;
  onJoin: () => void;
}

/** Layar sebelum masuk: pratinjau kamera, cek mic, pilih perangkat, isi nama. */
export default function PreJoin({ meetingId, onJoin }: Props) {
  const navigate = useNavigate();
  const {
    userId,
    setUserId,
    setMeetingId,
    camera,
    mic,
    videoDeviceId,
    audioDeviceId,
    videoQuality,
    setMedia,
  } = useGlobalStore();
  const [name, setName] = useState(userId || randomId());
  const [preview, setPreview] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const tracks = useRef<MediaStreamTrack[]>([]);

  const stop = () => {
    tracks.current.forEach((t) => t.stop());
    tracks.current = [];
  };

  const refreshDevices = useCallback(async () => {
    try {
      setDevices(await navigator.mediaDevices.enumerateDevices());
    } catch {
      /* abaikan */
    }
  }, []);

  // pratinjau mengikuti toggle & perangkat pilihan
  useEffect(() => {
    let cancelled = false;
    stop();
    setPreview(null);
    if (!camera && !mic) {
      void refreshDevices();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        "Camera/microphone unavailable. Open via http://localhost or HTTPS.",
      );
      return;
    }
    navigator.mediaDevices
      .getUserMedia({
        video: camera
          ? videoDeviceId
            ? { deviceId: { exact: videoDeviceId } }
            : true
          : false,
        audio: mic
          ? audioDeviceId
            ? { deviceId: { exact: audioDeviceId } }
            : true
          : false,
      })
      .then((stream) => {
        if (cancelled) return stream.getTracks().forEach((t) => t.stop());
        tracks.current = stream.getTracks();
        setError(null);
        setPreview(stream);
        void refreshDevices();
      })
      .catch(() => {
        if (cancelled) return;
        setError(
          "Camera/microphone permission denied or no device found. You can still join.",
        );
        setMedia({ camera: false, mic: false });
      });
    return () => {
      cancelled = true;
    };
  }, [camera, mic, videoDeviceId, audioDeviceId, setMedia, refreshDevices]);

  useEffect(() => stop, []);

  const join = () => {
    if (!name.trim()) return;
    stop(); // ruang rapat mengambil perangkat sendiri
    setUserId(name.trim());
    setMeetingId(meetingId);
    onJoin();
  };

  const previewVideo = useMemo(
    () =>
      preview && camera && preview.getVideoTracks().length
        ? new MediaStream(preview.getVideoTracks())
        : null,
    [preview, camera],
  );

  const cams = devices.filter((d) => d.kind === "videoinput");
  const mics = devices.filter((d) => d.kind === "audioinput");
  const label = (d: MediaDeviceInfo, i: number) => d.label || `Device ${i + 1}`;

  return (
    <div className="mx-auto grid min-h-dvh max-w-5xl items-center gap-8 px-6 py-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-4">
        <div className="relative">
          <VideoTile
            muted
            stream={previewVideo}
            cameraOn={camera}
            label={name || "You"}
          />
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-3">
            <Button
              size="icon-lg"
              className="rounded-full"
              variant={mic ? "secondary" : "destructive"}
              onClick={() => setMedia({ mic: !mic })}
              aria-label={mic ? "Mute microphone" : "Unmute microphone"}
            >
              {mic ? <MicIcon /> : <MicOffIcon />}
            </Button>
            <Button
              size="icon-lg"
              className="rounded-full"
              variant={camera ? "secondary" : "destructive"}
              onClick={() => setMedia({ camera: !camera })}
              aria-label={camera ? "Turn off camera" : "Turn on camera"}
            >
              {camera ? <VideoIcon /> : <VideoOffIcon />}
            </Button>
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="grid gap-2 sm:grid-cols-2">
          <SheetSelect
            title="Camera"
            value={videoDeviceId}
            onChange={(v) => setMedia({ videoDeviceId: v })}
            disabled={cams.length === 0}
            options={[
              { value: "", label: "Default camera" },
              ...cams.map((d, i) => ({
                value: d.deviceId,
                label: label(d, i),
              })),
            ]}
          />
          <SheetSelect
            title="Microphone"
            value={audioDeviceId}
            onChange={(v) => setMedia({ audioDeviceId: v })}
            disabled={mics.length === 0}
            options={[
              { value: "", label: "Default microphone" },
              ...mics.map((d, i) => ({
                value: d.deviceId,
                label: label(d, i),
              })),
            ]}
          />
          <SheetSelect
            title="Video quality"
            value={videoQuality}
            onChange={(v) => setMedia({ videoQuality: v as VideoQualityId })}
            options={VIDEO_QUALITY_OPTIONS}
          />
        </div>
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          join();
        }}
      >
        <h1 className="text-3xl font-medium">Ready to join?</h1>
        <p className="text-sm text-muted-foreground">
          Meeting code:{" "}
          <span className="font-medium text-foreground">{meetingId}</span>
        </p>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          aria-label="Your name"
          className="h-11"
        />
        <div className="flex gap-2">
          <Button
            type="submit"
            size="lg"
            className="h-11 flex-1"
            disabled={!name.trim()}
          >
            Join now
          </Button>
          <Button
            type="button"
            size="lg"
            variant="ghost"
            className="h-11"
            onClick={() => navigate("/")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
