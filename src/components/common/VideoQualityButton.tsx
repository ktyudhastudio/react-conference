import { useState } from "react";
import { GaugeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  VIDEO_QUALITY_OPTIONS,
  type VideoQualityId,
} from "@constants/videoQuality";
import BottomSheet from "./BottomSheet";
import OptionList from "./OptionList";

interface Props {
  value: VideoQualityId;
  onChange: (id: VideoQualityId) => void;
}

/** Tombol ikon di footer ruang rapat: pilih kualitas video yang dikirim. */
export default function VideoQualityButton({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        size="icon-lg"
        variant="ghost"
        className="size-11 rounded-full sm:size-9"
        onClick={() => setOpen(true)}
        aria-label="Video quality"
        title="Video quality"
      >
        <GaugeIcon />
      </Button>
      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title="Video quality"
        description="Lower quality uses less internet data."
      >
        <div className="max-h-[50vh] overflow-y-auto px-2 pb-2">
          <OptionList
            label="Video quality"
            options={VIDEO_QUALITY_OPTIONS}
            value={value}
            onChange={(v) => {
              onChange(v as VideoQualityId);
              setOpen(false);
            }}
          />
        </div>
      </BottomSheet>
    </>
  );
}
