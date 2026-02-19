"use client";

import { useState } from "react";

type TimelineEvent = {
  id: string;
  timestamp: number;
  actor: string;
  type: "message" | "task_update" | "agent_action" | "system";
  content: string;
};

type Props = {
  roomId: string;
  memberName: string;
};

// placeholder events
const placeholderEvents: TimelineEvent[] = [
  {
    id: "1",
    timestamp: Date.now() - 60000,
    actor: "System",
    type: "system",
    content: "Room created",
  },
  {
    id: "2",
    timestamp: Date.now(),
    actor: "You",
    type: "message",
    content: "War room is live",
  },
];

export default function Timeline({ roomId, memberName }: Props) {
  const [events, setEvents] = useState<TimelineEvent[]>(placeholderEvents);
  const [message, setMessage] = useState("");

  function sendMessage() {
    if (!message.trim()) return;

    const newEvent: TimelineEvent = {
      id: String(Date.now()),
      timestamp: Date.now(),
      actor: memberName,
      type: "message",
      content: message.trim(),
    };

    setEvents([...events, newEvent]);
    setMessage("");
  }

  function formatTime(ts: number) {
    return new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="flex flex-col h-full bg-[var(--surface)]">
      <div className="px-3 py-2 border-b border-[var(--border)]">
        <span className="text-xs font-medium tracking-wide uppercase text-[var(--muted)]">
          Timeline
        </span>
      </div>

      {/* event list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {events.map((ev) => (
          <div key={ev.id} className="text-xs">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[var(--muted)]">{formatTime(ev.timestamp)}</span>
              <span className="font-medium">{ev.actor}</span>
            </div>
            <div className="text-[var(--muted)] pl-0">{ev.content}</div>
          </div>
        ))}
      </div>

      {/* message input */}
      <div className="p-3 border-t border-[var(--border)]">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Send a message..."
            className="flex-1 px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)]"
          />
          <button
            onClick={sendMessage}
            className="px-3 py-2 text-xs rounded bg-[var(--accent)] text-white hover:opacity-90"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
