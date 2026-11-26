import { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";

interface Props {
  stream: MediaStream | null;
  label: string;
  muted?: boolean;
}

export default function VideoTile({ stream, label, muted }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);

  return (
    <div className="relative aspect-video overflow-hidden rounded-xl border bg-muted">
      <video ref={ref} autoPlay playsInline muted={muted} className="size-full object-cover" />
      <Badge className="absolute bottom-2 left-2" variant="secondary">
        {label}
      </Badge>
    </div>
  );
}
