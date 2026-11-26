import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquareIcon,
  MicIcon,
  MicOffIcon,
  PinIcon,
  PinOffIcon,
  UserXIcon,
  UsersIcon,
  VideoIcon,
  VideoOffIcon,
  Volume2Icon,
  VolumeXIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import ConfirmSheet from "@components/common/ConfirmSheet";
import ChatPanel from "@components/common/ChatPanel";
import MeetingSidebar from "@components/common/MeetingSidebar";
import LeaveButton from "@components/common/LeaveButton";
import MeetingFooter from "@components/common/MeetingFooter";
import MeetingInfo from "@components/common/MeetingInfo";
import ModeToggle from "@components/common/ModeToggle";
import SignalBadge from "@components/common/SignalBadge";
import VideoTile from "@components/common/VideoTile";
import useConference from "@hooks/useConference";
import useMeetingPanel from "@hooks/useMeetingPanel";
import { randomId } from "@helpers/id";
import { cn } from "@/lib/utils";

interface Props {
  meetingId: string;
}

const GRID_OPTIONS = [1, 2, 3, 4] as const;
type GridCols = (typeof GRID_OPTIONS)[number];

const COLS_CLASS: Record<GridCols, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
};

function AdminContent({ meetingId }: Props) {
  const navigate = useNavigate();
  const adminId = useRef(randomId("admin")).current;
  const {
    participants,
    blocked,
    messages,
    remote,
    error,
    sendChat,
    sendAdmin,
  } = useConference({
    meetingId,
    userId: adminId,
    observer: true,
  });
  const {
    panel,
    setPanel,
    open: sidebarOpen,
    openPanel,
    unread,
  } = useMeetingPanel(messages.length);
  const [cols, setCols] = useState<GridCols>(3);
  const [kickTarget, setKickTarget] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [listening, setListening] = useState<Set<string>>(new Set());

  const activePin = participants.some((p) => p.userId === pinned)
    ? pinned
    : null;
  const rest = participants.filter((p) => p.userId !== activePin);

  const toggleListen = (id: string) =>
    setListening((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  const togglePin = (id: string) => setPinned(id === activePin ? null : id);

  const tile = (id: string, large = false) => {
    const p = participants.find((x) => x.userId === id);
    return (
      <VideoTile
        key={id}
        stream={remote[id]?.stream ?? null}
        status={remote[id]?.status}
        cameraOn={p?.camera}
        micOn={p?.mic}
        quality={p?.quality}
        label={id}
        muted={!listening.has(id)}
        className={large ? "mx-auto max-h-full w-auto max-w-full" : undefined}
        actions={
          <>
            <Button
              size="icon-sm"
              variant="secondary"
              aria-label={listening.has(id) ? "Mute audio" : "Listen"}
              onClick={() => toggleListen(id)}
            >
              {listening.has(id) ? <Volume2Icon /> : <VolumeXIcon />}
            </Button>
            <Button
              size="icon-sm"
              variant="secondary"
              aria-label={id === activePin ? "Unpin" : "Pin"}
              onClick={() => togglePin(id)}
            >
              {id === activePin ? <PinOffIcon /> : <PinIcon />}
            </Button>
          </>
        }
      />
    );
  };

  return (
    <>
      <SidebarInset className="h-svh min-h-0 gap-3 bg-transparent p-3">
        <MeetingInfo meetingId={meetingId} className="md:hidden" />
        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto">
          {participants.length === 0 ? (
            <p className="m-auto text-muted-foreground">
              No one is in this meeting yet.
            </p>
          ) : (
            <>
              {activePin && (
                <div className="flex min-h-0 flex-1 items-center">
                  {tile(activePin, true)}
                </div>
              )}
              <div
                className={cn(
                  "grid gap-3",
                  activePin
                    ? "grid-cols-2 sm:grid-cols-4 lg:grid-cols-6"
                    : cn("w-full content-center", COLS_CLASS[cols]),
                  !activePin && "my-auto",
                )}
              >
                {rest.map((p) => tile(p.userId))}
              </div>
            </>
          )}
        </div>

        <MeetingFooter
          meetingId={meetingId}
          center={
            <>
              <div
                className="hidden items-center gap-1 rounded-full bg-secondary p-1 sm:flex"
                role="group"
                aria-label="Grid columns"
              >
                {GRID_OPTIONS.map((n) => (
                  <Button
                    key={n}
                    size="icon-sm"
                    variant={cols === n ? "default" : "ghost"}
                    className="rounded-full"
                    aria-pressed={cols === n}
                    aria-label={`${n} columns`}
                    title={`${n} columns`}
                    onClick={() => setCols(n)}
                    disabled={!!activePin}
                  >
                    {n}
                  </Button>
                ))}
              </div>
              <LeaveButton
                onConfirm={() => navigate("/admin")}
                title="Stop monitoring?"
                description="You'll leave this meeting view and go back to the list of active meetings. The meeting itself keeps running."
                confirmLabel="Stop monitoring"
              />
            </>
          }
          right={
            <>
              <ModeToggle className="hidden size-9 sm:inline-flex" />
              <Button
                size="icon-lg"
                variant={
                  sidebarOpen && panel === "people" ? "secondary" : "ghost"
                }
                className="relative size-11 rounded-full sm:size-9"
                onClick={() => openPanel("people")}
                aria-label="People"
                title="People"
              >
                <UsersIcon />
                <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px]">
                  {participants.length}
                </Badge>
              </Button>
              <Button
                size="icon-lg"
                variant={
                  sidebarOpen && panel === "chat" ? "secondary" : "ghost"
                }
                className="relative size-11 rounded-full sm:size-9"
                onClick={() => openPanel("chat")}
                aria-label="Chat"
                title="Chat"
              >
                <MessageSquareIcon />
                {unread > 0 && (
                  <span className="absolute top-2 right-2 size-2 rounded-full bg-primary" />
                )}
              </Button>
            </>
          }
        />
      </SidebarInset>

      <ConfirmSheet
        open={!!kickTarget}
        onOpenChange={(open) => !open && setKickTarget(null)}
        title="Remove participant?"
        description={
          <>
            <span className="font-medium text-foreground">{kickTarget}</span>{" "}
            will be removed from the meeting and cannot rejoin until you allow
            them again.
          </>
        }
        confirmLabel="Remove"
        destructive
        onConfirm={() => kickTarget && sendAdmin("kick", kickTarget)}
      />

      <MeetingSidebar
        panel={panel}
        onPanelChange={setPanel}
        peopleCount={participants.length}
        unread={unread}
        chat={
          <ChatPanel messages={messages} selfName="Admin" onSend={sendChat} />
        }
        people={
          <>
            <SidebarMenu>
              {participants.map((p) => (
                <SidebarMenuItem
                  key={p.userId}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm transition-colors hover:bg-muted"
                >
                  <span className="flex-1 truncate">{p.userId}</span>
                  <SignalBadge quality={p.quality} />
                  {p.mic ? (
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Mute participant microphone"
                      title="Mute participant microphone"
                      onClick={() => sendAdmin("mute_mic", p.userId)}
                    >
                      <MicIcon />
                    </Button>
                  ) : (
                    <MicOffIcon className="mx-2 size-4 text-muted-foreground" />
                  )}
                  {p.camera ? (
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Turn off participant camera"
                      title="Turn off participant camera"
                      onClick={() => sendAdmin("camera_off", p.userId)}
                    >
                      <VideoIcon />
                    </Button>
                  ) : (
                    <VideoOffIcon className="mx-2 size-4 text-muted-foreground" />
                  )}
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="text-destructive"
                    aria-label="Remove participant"
                    title="Remove participant"
                    onClick={() => setKickTarget(p.userId)}
                  >
                    <UserXIcon />
                  </Button>
                </SidebarMenuItem>
              ))}
              {participants.length === 0 && (
                <li className="px-2 py-4 text-center text-sm text-muted-foreground">
                  No participants yet.
                </li>
              )}
            </SidebarMenu>
            {blocked.length > 0 && (
              <div className="mt-4 space-y-1 border-t pt-3">
                <p className="px-2 text-xs text-muted-foreground">Removed</p>
                {blocked.map((id) => (
                  <div
                    key={id}
                    className="flex items-center gap-2 px-2 text-sm"
                  >
                    <span className="flex-1 truncate">{id}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendAdmin("allow", id)}
                    >
                      Allow
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        }
      />
    </>
  );
}

/** Layar pemantauan admin ala Meet: panggung peserta, bar kontrol bawah, panel peserta. */
export default function AdminView(props: Props) {
  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AdminContent {...props} />
    </SidebarProvider>
  );
}
