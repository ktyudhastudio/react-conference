import {
  MicIcon,
  MicOffIcon,
  UserIcon,
  VideoIcon,
  VideoOffIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import SignalBadge from "@components/common/SignalBadge";
import ChatPanel from "@components/common/ChatPanel";
import MeetingSidebar from "@components/common/MeetingSidebar";
import type { Panel } from "@components/common/PanelTabs";
import type { RemotePeer } from "@hooks/useConference";
import type {
  ChatMessage,
  Participant,
} from "@services/room/interfaces/participants.type";

interface Props {
  userId: string;
  cameraOn: boolean;
  micOn: boolean;
  participants: Participant[];
  remote: Record<string, RemotePeer>;
  messages: ChatMessage[];
  onSend: (text: string) => void;
  panel: Panel;
  onPanelChange: (p: Panel) => void;
  unread: number;
}

const STATUS_LABEL = {
  connecting: "Connecting",
  reconnecting: "Reconnecting",
  connected: "Connected",
} as const;

function MediaIcons({ camera, mic }: { camera: boolean; mic: boolean }) {
  const off = "size-4 text-muted-foreground";
  return (
    <span className="flex items-center gap-1">
      {mic ? <MicIcon className="size-4" /> : <MicOffIcon className={off} />}
      {camera ? (
        <VideoIcon className="size-4" />
      ) : (
        <VideoOffIcon className={off} />
      )}
    </span>
  );
}

export default function RoomSidebar({
  userId,
  cameraOn,
  micOn,
  participants,
  remote,
  messages,
  onSend,
  panel,
  onPanelChange,
  unread,
}: Props) {
  const others = participants.filter((p) => p.userId !== userId);

  return (
    <MeetingSidebar
      panel={panel}
      onPanelChange={onPanelChange}
      peopleCount={others.length + 1}
      unread={unread}
      chat={<ChatPanel messages={messages} selfName={userId} onSend={onSend} />}
      people={
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-muted">
            <UserIcon className="size-4 text-muted-foreground" />
            <span className="flex-1 truncate">{userId} (You)</span>
            <SignalBadge
              quality={participants.find((p) => p.userId === userId)?.quality}
            />
            <MediaIcons camera={cameraOn} mic={micOn} />
          </SidebarMenuItem>
          {others.map(({ userId: id, camera, mic, quality }) => (
            <SidebarMenuItem
              key={id}
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-muted"
            >
              <UserIcon className="size-4 text-muted-foreground" />
              <span className="flex-1 truncate">{id}</span>
              <SignalBadge quality={quality} />
              <MediaIcons camera={camera} mic={mic} />
              {remote[id]?.status !== "connected" && (
                <Badge variant="outline">
                  {STATUS_LABEL[remote[id]?.status ?? "connecting"]}
                </Badge>
              )}
            </SidebarMenuItem>
          ))}
          {others.length === 0 && (
            <li className="px-2 py-4 text-center text-sm text-muted-foreground">
              No one else is here yet. Share the meeting code to invite people.
            </li>
          )}
        </SidebarMenu>
      }
    />
  );
}
