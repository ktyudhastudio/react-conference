import { useState, type ReactNode } from "react";
import { LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmSheet from "./ConfirmSheet";

interface Props {
  onConfirm: () => void;
  title?: string;
  description?: ReactNode;
  confirmLabel?: string;
}

/** Tombol keluar yang tegas (merah solid); menekannya membuka konfirmasi bottom sheet. */
export default function LeaveButton({
  onConfirm,
  title = "Leave meeting?",
  description = "You'll be disconnected from this meeting. You can rejoin with the same code.",
  confirmLabel = "Leave",
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        aria-label="Leave"
        title="Leave"
        aria-haspopup="dialog"
        className="h-11 rounded-full bg-destructive px-5 font-semibold text-white shadow-sm hover:bg-destructive/85 focus-visible:ring-destructive/40 sm:h-9 sm:px-4 dark:bg-destructive dark:hover:bg-destructive/85"
      >
        <LogOutIcon />
        Leave
      </Button>
      <ConfirmSheet
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        destructive
        onConfirm={onConfirm}
      />
    </>
  );
}
