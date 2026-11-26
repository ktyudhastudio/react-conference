import { useEffect, useRef, type ReactNode } from "react";
import { MicOffIcon, VideoOffIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Quality } from "@services/room/interfaces/participants.type";
import SignalBadge from "./SignalBadge";
import type { PeerStatus } from "@hooks/useConference";

interface Props {
  stream: MediaStream | null;
  label: string;
  muted?: boolean;
  status?: PeerStatus | null;
  /** Tile kecil melayang (self-view) */
  pip?: boolean;
  className?: string;
  /** cermin video (self-view kamera depan); default: mengikuti `muted` */
  mirror?: boolean;
  /** false = kamera mati: tampilkan kartu avatar (audio tetap diputar) */
  cameraOn?: boolean;
  /** false = mikrofon mati: tampilkan indikator */
  micOn?: boolean;
  /** kualitas koneksi (ikon sinyal di pojok kiri atas) */
  quality?: Quality;
  /** Tombol aksi yang muncul saat hover (pojok kanan atas) */
  actions?: ReactNode;
}

const STATUS_TEXT: Record<PeerStatus, string> = {
  connecting: "Connecting…",
  reconnecting: "Network issues, reconnecting…",
  connected: "",
};

export default function VideoTile({
  stream,
  label,
  muted,
  status,
  pip,
  className,
  actions,
  cameraOn = true,
  micOn,
  quality,
  mirror,
}: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);

  const showVideo = !!stream && cameraOn;
  const notice = status && status !== "connected" ? STATUS_TEXT[status] : "";

  return (
    <div
      className={cn(
        "group/tile animate-in fade-in-0 zoom-in-95 relative aspect-video duration-300 overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/10",
        className,
      )}
    >
      <video
        ref={ref}
        autoPlay
        playsInline
        muted={muted}
        className={cn(
          "size-full object-cover",
          !showVideo && "invisible",
          (mirror ?? muted) && "-scale-x-100",
        )}
      />
      {!showVideo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <div
            className={cn(
              "flex items-center justify-center rounded-full bg-secondary font-medium text-secondary-foreground uppercase",
              pip ? "size-10 text-base" : "size-20 text-3xl",
            )}
          >
            {label.charAt(0) || <VideoOffIcon />}
          </div>
          {!pip && <span className="text-sm">{notice || "Camera off"}</span>}
        </div>
      )}
      {showVideo && notice && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 text-sm">
          {notice}
        </div>
      )}
      {(micOn === false || quality) && (
        <div className="absolute top-2 left-2 flex items-center gap-1">
          {micOn === false && (
            <span className="flex size-6 items-center justify-center rounded-full bg-background/70 text-muted-foreground">
              <MicOffIcon className="size-3.5" />
            </span>
          )}
          {quality && (
            <span className="flex size-6 items-center justify-center rounded-full bg-background/70">
              <SignalBadge quality={quality} />
            </span>
          )}
        </div>
      )}
      {actions && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover/tile:opacity-100 focus-within:opacity-100">
          {actions}
        </div>
      )}
      <Badge
        className="absolute bottom-2 left-2 max-w-[80%] truncate"
        variant="secondary"
      >
        {label}
      </Badge>
    </div>
  );
}
