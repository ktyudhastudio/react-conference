import { toast } from "sonner";
import { CopyIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Clock from "./Clock";

/** Info rapat di bar bawah (seperti Meet): jam | kode rapat + salin. */
export default function MeetingInfo({
  meetingId,
  className,
}: {
  meetingId: string;
  className?: string;
}) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(meetingId);
      toast.success("Meeting code copied");
    } catch {
      toast.error("Failed to copy meeting code");
    }
  };

  return (
    <div className={cn("flex min-w-0 items-center gap-2 text-sm", className)}>
      <Clock />
      <Separator orientation="vertical" className="h-4" />
      <span className="truncate font-medium">{meetingId}</span>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={copy}
        aria-label="Copy meeting code"
        title="Copy meeting code"
      >
        <CopyIcon />
      </Button>
    </div>
  );
}
