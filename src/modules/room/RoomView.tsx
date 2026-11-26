import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import VideoTile from "@components/common/VideoTile";
import useConference from "@hooks/useConference";

interface Props {
  meetingId: string;
  userId: string;
}

export default function RoomView({ meetingId, userId }: Props) {
  const { localStream, remote, error, publish, subscribe } = useConference({ meetingId, userId });
  const [peerId, setPeerId] = useState("");

  if (error) toast.error(error, { id: "room-error" });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={publish} disabled={!!localStream}>
          Nyalakan Kamera
        </Button>
        <Input
          className="w-48"
          placeholder="ID peer"
          value={peerId}
          onChange={(e) => setPeerId(e.target.value)}
        />
        <Button variant="outline" disabled={!peerId} onClick={() => subscribe(peerId)}>
          Tonton
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <VideoTile stream={localStream} label={`${userId} (Anda)`} muted />
        {Object.entries(remote).map(([id, s]) => (
          <VideoTile key={id} stream={s} label={id} />
        ))}
      </div>
    </div>
  );
}
