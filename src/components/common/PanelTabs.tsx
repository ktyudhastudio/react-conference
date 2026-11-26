import SegmentedTabs from "./SegmentedTabs";

export type Panel = "people" | "chat";

interface Props {
  value: Panel;
  onChange: (p: Panel) => void;
  peopleCount: number;
  unread?: number;
}

/** Pengalih panel sidebar: People / Chat. */
export default function PanelTabs({
  value,
  onChange,
  peopleCount,
  unread = 0,
}: Props) {
  return (
    <SegmentedTabs
      label="Panel"
      value={value}
      onChange={(v) => onChange(v as Panel)}
      items={[
        { value: "people", label: `People (${peopleCount})` },
        { value: "chat", label: unread > 0 ? `Chat (${unread})` : "Chat" },
      ]}
    />
  );
}
