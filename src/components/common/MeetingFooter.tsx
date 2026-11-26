import type { ReactNode } from "react";
import MeetingInfo from "./MeetingInfo";

interface Props {
  meetingId: string;
  /** kontrol utama (mic, kamera, keluar) */
  center: ReactNode;
  /** kontrol sekunder (panel, tema) */
  right: ReactNode;
}

/**
 * Bar bawah ruang rapat. Desktop: info rapat | kontrol utama | kontrol sekunder.
 * Mobile: satu baris kontrol di tengah (info rapat dipindah ke atas layar).
 */
export default function MeetingFooter({ meetingId, center, right }: Props) {
  return (
    <footer className="flex shrink-0 items-center justify-center gap-2 pb-[env(safe-area-inset-bottom)] md:grid md:h-14 md:grid-cols-[1fr_auto_1fr] md:gap-3">
      <div className="hidden min-w-0 md:flex">
        <MeetingInfo meetingId={meetingId} />
      </div>
      <div className="flex items-center gap-2">{center}</div>
      <div className="flex items-center gap-1 md:justify-end">{right}</div>
    </footer>
  );
}
