import type { ReactNode } from "react";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import PanelTabs, { type Panel } from "./PanelTabs";

interface Props {
  panel: Panel;
  onPanelChange: (p: Panel) => void;
  peopleCount: number;
  unread: number;
  people: ReactNode;
  chat: ReactNode;
}

/** Sidebar kanan ala Meet: tab Peserta / Chat. Dipakai ruang rapat dan admin. */
export default function MeetingSidebar({
  panel,
  onPanelChange,
  peopleCount,
  unread,
  people,
  chat,
}: Props) {
  const { toggleSidebar } = useSidebar();
  return (
    <Sidebar side="right" variant="inset">
      <SidebarHeader className="flex-row items-center gap-2">
        <div className="flex-1">
          <PanelTabs
            value={panel}
            onChange={onPanelChange}
            peopleCount={peopleCount}
            unread={unread}
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Close"
        >
          <XIcon />
        </Button>
      </SidebarHeader>
      {panel === "people" ? (
        <SidebarContent className="p-2">{people}</SidebarContent>
      ) : (
        chat
      )}
    </Sidebar>
  );
}
