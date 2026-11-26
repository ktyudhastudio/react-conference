import { useEffect, useState } from "react";

interface Props {
  /** tampilkan tanggal di samping jam */
  withDate?: boolean;
}

export default function Clock({ withDate }: Props) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(t);
  }, []);

  const time = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const date = now.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  return (
    <span className="tabular-nums">
      {time}
      {withDate && ` • ${date}`}
    </span>
  );
}
