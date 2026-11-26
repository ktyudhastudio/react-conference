import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface SegmentedItem {
  value: string;
  label: string;
  /** isi sebagai tautan rute (tab navigasi); tanpa ini dirender sebagai tombol */
  to?: string;
}

interface Props {
  items: SegmentedItem[];
  value: string;
  onChange?: (value: string) => void;
  label: string;
  className?: string;
}

/** Tab segmen dengan indikator yang meluncur halus ke tab aktif. */
export default function SegmentedTabs({
  items,
  value,
  onChange,
  label,
  className,
}: Props) {
  const index = Math.max(
    0,
    items.findIndex((i) => i.value === value),
  );
  const n = items.length;

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn("relative grid rounded-lg bg-muted p-1 text-sm", className)}
      style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden
        className="absolute inset-y-1 left-1 rounded-md bg-background shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          width: `calc((100% - 0.5rem) / ${n})`,
          transform: `translateX(${index * 100}%)`,
        }}
      />
      {items.map((item) => {
        const active = item.value === value;
        const cls = cn(
          "relative z-10 flex items-center justify-center rounded-md px-3 py-1 font-medium whitespace-nowrap transition-colors duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          active
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground",
        );
        return item.to ? (
          <Link
            key={item.value}
            to={item.to}
            role="tab"
            aria-selected={active}
            className={cls}
          >
            {item.label}
          </Link>
        ) : (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            className={cls}
            onClick={() => onChange?.(item.value)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
