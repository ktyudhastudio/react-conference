import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRightIcon,
  KeyboardIcon,
  UsersIcon,
  VideoIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import useGetMeetings from "@services/admin/hooks/useGetMeetings";
import { parseMeetingCode } from "@helpers/id";

/** Lama rapat berjalan, mis. "12 menit" / "1 jam 5 menit". */
function useDuration(startedAt: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  const min = Math.max(0, Math.floor((now - startedAt) / 60_000));
  if (min < 1) return "just started";
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}

function Duration({ startedAt }: { startedAt: number }) {
  return <>{useDuration(startedAt)}</>;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { meetings, loading, error } = useGetMeetings();
  const [code, setCode] = useState("");
  const id = parseMeetingCode(code);

  const watch = (meetingId: string) =>
    navigate(`/admin/${encodeURIComponent(meetingId)}`);
  const totalPeople = meetings.reduce((n, m) => n + m.participants, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Active meetings</h1>
          <p className="text-sm text-muted-foreground">
            Pick a meeting to monitor. The list updates automatically.
          </p>
        </div>
        <form
          className="flex w-full gap-2 sm:w-auto"
          onSubmit={(e) => {
            e.preventDefault();
            if (id) watch(id);
          }}
        >
          <div className="relative">
            <KeyboardIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="w-full pl-9 sm:w-56"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Monitor by code"
              aria-label="Meeting code"
            />
          </div>
          <Button type="submit" variant="outline" disabled={!id}>
            Monitor
          </Button>
        </form>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
              <VideoIcon className="size-4" /> Meetings in progress
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-medium">
            {meetings.length}
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
              <UsersIcon className="size-4" /> Total participants
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-medium">
            {totalPeople}
          </CardContent>
        </Card>
      </div>

      {error && (
        <p className="text-sm text-destructive">
          Couldn't load the meeting list. Make sure the server is running.
        </p>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : meetings.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          No meetings in progress.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {meetings.map((m, i) => (
            <Card
              key={m.id}
              size="sm"
              style={{
                animationDelay: `${Math.min(i, 8) * 50}ms`,
                animationFillMode: "backwards",
              }}
              className="animate-in transition-[transform,box-shadow] duration-300 fade-in-0 slide-in-from-bottom-2 hover:-translate-y-0.5 hover:shadow-md"
            >
              <CardHeader>
                <CardTitle className="truncate">{m.id}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary">
                    <UsersIcon /> {m.participants} participants
                  </Badge>
                  <span>
                    Running for <Duration startedAt={m.startedAt} />
                  </span>
                </div>
                <Button className="w-full" onClick={() => watch(m.id)}>
                  Monitor <ArrowRightIcon />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
