import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import BottomSheet from "./BottomSheet";
import OptionList, { type Option } from "./OptionList";

export type SheetSelectOption = Option;

type Props = {
  options: Option[];
  /** judul bottom sheet & label aksesibilitas */
  title: string;
  disabled?: boolean;
  className?: string;
  /** teks tombol saat tidak ada yang dipilih (mode multiple) */
  placeholder?: string;
} & (
  | { mode?: "single"; value: string; onChange: (value: string) => void }
  | { mode: "multiple"; value: string[]; onChange: (value: string[]) => void }
);

/**
 * Pengganti <select>: tombol pemicu + BottomSheet + OptionList.
 * `mode="single"` (radio, menutup otomatis) atau `mode="multiple"` (checkbox + tombol Done).
 */
export default function SheetSelect(props: Props) {
  const {
    options,
    title,
    disabled,
    className,
    placeholder = "Select…",
  } = props;
  const [open, setOpen] = useState(false);

  const summary =
    props.mode === "multiple"
      ? props.value.length === 0
        ? placeholder
        : props.value.length === 1
          ? (options.find((o) => o.value === props.value[0])?.label ??
            placeholder)
          : `${props.value.length} selected`
      : (options.find((o) => o.value === props.value) ?? options[0])?.label;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        aria-label={title}
        aria-haspopup="dialog"
        className={cn("w-full justify-between font-normal", className)}
        onClick={() => setOpen(true)}
      >
        <span className="truncate">{summary}</span>
        <ChevronDownIcon className="text-muted-foreground" />
      </Button>
      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title={title}
        footer={
          props.mode === "multiple" && (
            <Button size="lg" className="h-10" onClick={() => setOpen(false)}>
              Done
            </Button>
          )
        }
      >
        <div className="max-h-[50vh] overflow-y-auto px-2 pb-2">
          {props.mode === "multiple" ? (
            <OptionList
              mode="multiple"
              label={title}
              options={options}
              value={props.value}
              onChange={props.onChange}
            />
          ) : (
            <OptionList
              label={title}
              options={options}
              value={props.value}
              onChange={(v) => {
                props.onChange(v);
                setOpen(false);
              }}
            />
          )}
        </div>
      </BottomSheet>
    </>
  );
}
