import { SignalHighIcon, SignalLowIcon, SignalMediumIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  Quality,
  QualityLevel,
} from "@services/room/interfaces/participants.type";

const LEVELS: Record<
  QualityLevel,
  { label: string; Icon: typeof SignalHighIcon; color: string }
> = {
  good: {
    label: "Good connection",
    Icon: SignalHighIcon,
    color: "text-emerald-500",
  },
  fair: {
    label: "Fair connection",
    Icon: SignalMediumIcon,
    color: "text-amber-500",
  },
  poor: {
    label: "Poor connection",
    Icon: SignalLowIcon,
    color: "text-destructive",
  },
};

/** Ikon sinyal; hover menampilkan RTT, packet loss, jitter, dan bitrate. */
export default function SignalBadge({
  quality,
  className,
}: {
  quality?: Quality;
  className?: string;
}) {
  if (!quality) return null;
  const { label, Icon, color } = LEVELS[quality.level];
  const detail = `${label}\nRTT ${quality.rttMs} ms · Loss ${quality.lossPct}% · Jitter ${quality.jitterMs} ms · ${quality.bitrateKbps} kbps`;
  return (
    <span
      title={detail}
      aria-label={detail}
      className={cn("inline-flex", color, className)}
    >
      <Icon className="size-4" />
    </span>
  );
}
