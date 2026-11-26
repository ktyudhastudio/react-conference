import { useEffect, useRef, useState } from "react";
import { SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@services/room/interfaces/participants.type";

interface Props {
  messages: ChatMessage[];
  /** nama pengirim sendiri (untuk membedakan pesan sendiri) */
  selfName: string;
  onSend: (text: string) => void;
}

const fmt = (at: number) =>
  new Date(at).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

export default function ChatPanel({ messages, selfName, onSend }: Props) {
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {messages.length === 0 && (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            Messages are only visible to participants while the meeting is in
            progress.
          </p>
        )}
        {messages.map((m) => {
          const mine = m.from === selfName;
          return (
            <div
              key={m.id}
              className={cn(
                "flex animate-in flex-col gap-0.5 duration-300 fade-in-0 slide-in-from-bottom-1",
                mine && "items-end",
              )}
            >
              <span className="text-xs text-muted-foreground">
                {mine ? "You" : m.from} · {fmt(m.at)}
              </span>
              <p
                className={cn(
                  "max-w-[85%] rounded-xl px-3 py-1.5 text-sm break-words whitespace-pre-wrap",
                  mine ? "bg-primary text-primary-foreground" : "bg-muted",
                )}
              >
                {m.text}
              </p>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <form
        className="flex gap-2 border-t p-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          onSend(text);
          setText("");
        }}
      >
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Send a message"
          maxLength={1000}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!text.trim()}
          aria-label="Send"
        >
          <SendIcon />
        </Button>
      </form>
    </div>
  );
}
