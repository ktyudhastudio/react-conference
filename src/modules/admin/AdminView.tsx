import { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import VideoTile from "@components/common/VideoTile";
import useConference from "@hooks/useConference";
import useGetPeers from "@services/room/hooks/useGetPeers";
import { randomId } from "@helpers/id";

interface Props {
  meetingId: string;
}

/** Admin = penonton saja: otomatis subscribe ke semua publisher aktif. */
export default function AdminView({ meetingId }: Props) {
  const adminId = useRef(randomId("admin")).current;
  const { peers } = useGetPeers(meetingId);
  const { remote, error, subscribe } = useConference({ meetingId, userId: adminId });
  const subscribed = useRef(new Set<string>());

  useEffect(() => {
    peers.forEach((p) => {
      if (subscribed.current.has(p)) return;
      subscribed.current.add(p);
      void subscribe(p);
    });
  }, [peers, subscribe]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        Meeting <Badge variant="secondary">{meetingId}</Badge>
        Peserta aktif <Badge>{peers.length}</Badge>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {peers.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">Belum ada peserta yang menyalakan kamera.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {peers.map((id) => (
            <VideoTile key={id} stream={remote[id] ?? null} label={id} muted />
          ))}
        </div>
      )}
    </div>
  );
}
