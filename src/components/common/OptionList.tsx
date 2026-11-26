import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

export interface Option {
  value: string;
  label: string;
  description?: string;
}

type Props = { options: Option[]; label: string; className?: string } & (
  | { mode?: "single"; value: string; onChange: (value: string) => void }
  | { mode: "multiple"; value: string[]; onChange: (value: string[]) => void }
);

// nilai kosong ("") dipakai sebagai "default"; radio butuh nilai tidak kosong
const EMPTY = "__empty__";
const enc = (v: string) => (v === "" ? EMPTY : v);
const dec = (v: string) => (v === EMPTY ? "" : v);

const rowClass =
  "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted has-data-checked:bg-secondary";

function OptionText({ option }: { option: Option }) {
  return (
    <span className="min-w-0 flex-1">
      <span className="block truncate">{option.label}</span>
      {option.description && (
        <span className="block truncate text-xs text-muted-foreground">
          {option.description}
        </span>
      )}
    </span>
  );
}

/**
 * Daftar opsi (molekul): satu pilihan = radio, banyak pilihan = checkbox.
 * Disusun dari atom shadcn `RadioGroup` / `Checkbox`, jadi bisa dipakai di mana saja
 * (bottom sheet, popover, halaman).
 */
export default function OptionList(props: Props) {
  const { options, label, className } = props;

  if (props.mode === "multiple") {
    const selected = new Set(props.value);
    const toggle = (v: string, on: boolean) => {
      const next = new Set(selected);
      if (on) next.add(v);
      else next.delete(v);
      props.onChange(options.map((o) => o.value).filter((x) => next.has(x)));
    };
    return (
      <div
        role="group"
        aria-label={label}
        className={cn("space-y-1", className)}
      >
        {options.map((o) => (
          <label key={o.value} className={rowClass}>
            <Checkbox
              checked={selected.has(o.value)}
              onCheckedChange={(on) => toggle(o.value, !!on)}
            />
            <OptionText option={o} />
          </label>
        ))}
      </div>
    );
  }

  return (
    <RadioGroup
      aria-label={label}
      value={enc(props.value)}
      onValueChange={(v) => props.onChange(dec(String(v)))}
      className={cn("gap-1", className)}
    >
      {options.map((o) => (
        <label key={o.value} className={rowClass}>
          <RadioGroupItem value={enc(o.value)} />
          <OptionText option={o} />
        </label>
      ))}
    </RadioGroup>
  );
}
