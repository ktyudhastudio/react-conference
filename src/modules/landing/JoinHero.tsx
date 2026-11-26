import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyboardIcon, PlusIcon } from "lucide-react";
import HeroLayout from "@components/common/HeroLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { meetingCode, parseMeetingCode } from "@helpers/id";

export default function JoinHero() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const id = parseMeetingCode(code);

  const go = (meetingId: string) =>
    navigate(`/room/${encodeURIComponent(meetingId)}`);

  return (
    <HeroLayout
      title="Video meetings for everyone"
      description="Start a new meeting or join with a code. You can check your camera and microphone before entering."
    >
      <form
        className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
        onSubmit={(e) => {
          e.preventDefault();
          if (id) go(id);
        }}
      >
        <Button
          type="button"
          size="lg"
          className="h-11 px-4"
          onClick={() => go(meetingCode())}
        >
          <PlusIcon /> New meeting
        </Button>
        <div className="relative w-full sm:w-auto">
          <KeyboardIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-11 w-full pl-9 sm:w-64"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter a code or link"
            aria-label="Meeting code"
          />
        </div>
        <Button
          type="submit"
          variant="ghost"
          size="lg"
          className="h-11"
          disabled={!id}
        >
          Join
        </Button>
      </form>
    </HeroLayout>
  );
}
