import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  CopyIcon,
  MessageSquareIcon,
  MicIcon,
  MicOffIcon,
  SwitchCameraIcon,
  UsersIcon,
  VideoIcon,
  VideoOffIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import LeaveButton from "@components/common/LeaveButton";
import MeetingFooter from "@components/common/MeetingFooter";
import MeetingInfo from "@components/common/MeetingInfo";
import ModeToggle from "@components/common/ModeToggle";
import VideoTile from "@components/common/VideoTile";
import useConference from "@hooks/useConference";
import useMeetingPanel from "@hooks/useMeetingPanel";
import useGlobalStore from "@store/useStore";
import { cn } from "@/lib/utils";
import RoomSidebar from "./RoomSidebar";

interface Props {
  meetingId: string;
  userId: string;
}

function gridCols(n: number) {
  if (n <= 1) return "grid-cols-1 max-w-3xl";
  if (n <= 2) return "grid-cols-1 sm:grid-cols-2";
  if (n <= 4) return "grid-cols-2 max-w-4xl";
  return "grid-cols-2 lg:grid-cols-3";
}

function RoomContent({ meetingId, userId }: Props) {
  const navigate = useNavigate();
  const { camera, mic, videoDeviceId, audioDeviceId } =
    useGlobalStore.getState();

  const {
    participants,
    messages,
    socketFailed,
    localStream,
    cameraOn,
    micOn,
    busy,
    publishStatus,
    remote,
    error,
    toggleCamera,
    toggleMic,
    flipCamera,
    cameraCount,
    facing,
    sendChat,
  } = useConference({
    meetingId,
    userId,
    initialMedia: { camera, mic, videoDeviceId, audioDeviceId },
    onCommand: (action) => {
      if (action === "mute_mic") toast.info("An admin muted your microphone");
      if (action === "camera_off")
        toast.info("An admin turned off your camera");
      if (action === "kick") {
        toast.error("You were removed from the meeting by an admin");
        navigate("/");
      }
    },
  });
  const {
    panel,
    setPanel,
    open: sidebarOpen,
    openPanel,
    unread,
  } = useMeetingPanel(messages.length);

  useEffect(() => {
    if (error) toast.error(error, { id: "room-error" });
  }, [error]);

  useEffect(() => {
    if (socketFailed) {
      toast.error(
        "Couldn't connect to the meeting. You may have been removed by an admin, or the server is down.",
        {
          id: "room-socket",
        },
      );
    }
  }, [socketFailed]);

  // semua peserta di room (termasuk yang kameranya mati), selain diri sendiri
  const others = participants.filter((p) => p.userId !== userId);
  const self = participants.find((p) => p.userId === userId);
  // 1 lawan bicara: video lawan besar + self-view kecil (seperti Meet)
  const pipMode = others.length === 1;

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Invite link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  const tileOf = (p: (typeof others)[number], className?: string) => (
    <VideoTile
      key={p.userId}
      stream={remote[p.userId]?.stream ?? null}
      status={remote[p.userId]?.status}
      cameraOn={p.camera}
      micOn={p.mic}
      quality={p.quality}
      label={p.userId}
      className={className}
    />
  );

  return (
    <>
      <SidebarInset className="h-svh min-h-0 gap-3 bg-transparent p-3">
        <MeetingInfo meetingId={meetingId} className="md:hidden" />
        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto">
          {pipMode ? (
            <>
              {tileOf(others[0], "max-h-full w-auto max-w-full")}
              <VideoTile
                pip
                muted
                stream={localStream}
                status={publishStatus}
                cameraOn={cameraOn}
                micOn={micOn}
                quality={self?.quality}
                mirror={facing === "user"}
                label="You"
                className="absolute right-3 bottom-3 w-40 shadow-lg sm:w-56"
              />
            </>
          ) : (
            <div className="flex w-full flex-col items-center gap-4">
              <div
                className={cn(
                  "grid w-full content-center gap-3",
                  gridCols(1 + others.length),
                )}
              >
                <VideoTile
                  muted
                  stream={localStream}
                  status={publishStatus}
                  cameraOn={cameraOn}
                  micOn={micOn}
                  quality={self?.quality}
                  mirror={facing === "user"}
                  label={`${userId} (You)`}
                />
                {others.map((p) => tileOf(p))}
              </div>
              {others.length === 0 && (
                <div className="flex animate-in flex-col items-center gap-2 text-center duration-500 fade-in-0 slide-in-from-bottom-2">
                  <p className="text-sm text-muted-foreground">
                    You&apos;re the only one here. Invite someone to join.
                  </p>
                  <Button variant="outline" onClick={copyInvite}>
                    <CopyIcon /> Copy invite link
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <MeetingFooter
          meetingId={meetingId}
          center={
            <>
              <Button
                size="icon-lg"
                variant={micOn ? "secondary" : "destructive"}
                className="size-11 rounded-full sm:size-9"
                onClick={toggleMic}
                disabled={busy}
                aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
                title={micOn ? "Mute microphone" : "Unmute microphone"}
              >
                {micOn ? <MicIcon /> : <MicOffIcon />}
              </Button>
              <Button
                size="icon-lg"
                variant={cameraOn ? "secondary" : "destructive"}
                className="size-11 rounded-full sm:size-9"
                onClick={toggleCamera}
                disabled={busy}
                aria-label={cameraOn ? "Turn off camera" : "Turn on camera"}
                title={cameraOn ? "Turn off camera" : "Turn on camera"}
              >
                {cameraOn ? <VideoIcon /> : <VideoOffIcon />}
              </Button>
              {cameraOn && cameraCount > 1 && (
                <Button
                  size="icon-lg"
                  variant="secondary"
                  className="size-11 rounded-full sm:size-9"
                  onClick={flipCamera}
                  disabled={busy}
                  aria-label="Switch camera"
                  title="Switch camera"
                >
                  <SwitchCameraIcon />
                </Button>
              )}
              <LeaveButton onConfirm={() => navigate("/")} />
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
                className="size-11 rounded-full sm:size-9"
                onClick={() => openPanel("people")}
                aria-label="People"
                title="People"
              >
                <UsersIcon />
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
      <RoomSidebar
        userId={userId}
        cameraOn={cameraOn}
        micOn={micOn}
        participants={participants}
        remote={remote}
        messages={messages}
        onSend={sendChat}
        panel={panel}
        onPanelChange={setPanel}
        unread={unread}
      />
    </>
  );
}

export default function RoomView(props: Props) {
  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <RoomContent {...props} />
    </SidebarProvider>
  );
}
