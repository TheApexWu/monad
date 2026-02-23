"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Types (local to this page, no external deps)
// ---------------------------------------------------------------------------

type MemberStatus = {
  name: string;
  status: "building" | "blocked" | "idle" | "reviewing" | "away";
  workingOn: string;
  lastUpdate: number;
};

type RoomEvent = {
  id: string;
  actor: string;
  content: string;
  type: "status_update" | "message" | "join";
  timestamp: number;
};

type RoomState = {
  id: string;
  members: Record<string, MemberStatus>;
  events: RoomEvent[];
  createdAt: number;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_META: Record<string, { label: string; color: string }> = {
  building: { label: "building", color: "var(--status-building)" },
  blocked: { label: "blocked", color: "var(--status-blocked)" },
  idle: { label: "idle", color: "var(--status-idle)" },
  reviewing: { label: "reviewing", color: "var(--status-reviewing)" },
  away: { label: "away", color: "var(--status-away)" },
};

function timeAgo(ts: number): string {
  const diff = Math.max(0, Date.now() - ts);
  const sec = Math.floor(diff / 1000);
  if (sec < 10) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  return `${hr}h ago`;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ---------------------------------------------------------------------------
// Room content
// ---------------------------------------------------------------------------

function RoomContent() {
  const params = useSearchParams();
  const roomId = params.get("id") || "default";
  const memberName = params.get("name") || "anon";

  const [room, setRoom] = useState<RoomState | null>(null);
  const [myStatus, setMyStatus] = useState<string>("idle");
  const [myTask, setMyTask] = useState("");
  const [msgInput, setMsgInput] = useState("");
  const [copied, setCopied] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const joinedRef = useRef(false);
  const prevEventCount = useRef(0);

  // API helpers
  const api = useCallback(
    async (method: "GET" | "POST", body?: Record<string, unknown>) => {
      const opts: RequestInit = { method };
      if (body) {
        opts.headers = { "Content-Type": "application/json" };
        opts.body = JSON.stringify({ ...body, name: memberName });
      }
      const res = await fetch(`/api/room/${roomId}`, opts);
      return (await res.json()) as RoomState;
    },
    [roomId, memberName]
  );

  // Join room on mount
  useEffect(() => {
    if (joinedRef.current) return;
    joinedRef.current = true;
    api("POST", { action: "join" }).then(setRoom);
  }, [api]);

  // Poll every 3 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await api("GET");
        setRoom(data);
      } catch {
        // network hiccup, skip
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [api]);

  // Heartbeat every 60 seconds to prevent going stale
  useEffect(() => {
    const interval = setInterval(() => {
      api("POST", { action: "heartbeat" }).catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, [api]);

  // Auto-scroll feed when new events arrive
  useEffect(() => {
    if (room && room.events.length > prevEventCount.current) {
      prevEventCount.current = room.events.length;
      requestAnimationFrame(() => {
        feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
      });
    }
  }, [room]);

  // Sync local status state from server on first load
  useEffect(() => {
    if (room?.members[memberName]) {
      setMyStatus(room.members[memberName].status);
      setMyTask(room.members[memberName].workingOn);
    }
    // Only on first load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.id]);

  // Handlers
  async function handleStatusUpdate() {
    const data = await api("POST", {
      action: "update_status",
      status: myStatus,
      workingOn: myTask,
    });
    setRoom(data);
  }

  async function handleMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!msgInput.trim()) return;
    const data = await api("POST", { action: "message", content: msgInput });
    setRoom(data);
    setMsgInput("");
  }

  function handleCopyLink() {
    const url = `${window.location.origin}/room?id=${roomId}&name=`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!room) {
    return (
      <div className="flex items-center justify-center h-screen text-[var(--muted)]">
        Connecting...
      </div>
    );
  }

  const members = Object.values(room.members).sort(
    (a, b) => b.lastUpdate - a.lastUpdate
  );
  const onlineCount = members.filter((m) => m.status !== "away").length;

  return (
    <div className="flex flex-col h-screen">
      {/* ---- TOP BAR ---- */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold tracking-tight">MONAD</span>
          <span className="text-sm text-[var(--muted)] font-mono">{roomId}</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleCopyLink}
            className="text-xs px-3 py-1.5 rounded bg-[var(--border)] hover:bg-[var(--muted)]/20 transition-colors"
          >
            {copied ? "Copied!" : "Copy invite link"}
          </button>
          <span className="text-sm text-[var(--muted)]">
            <span
              className="inline-block w-2 h-2 rounded-full mr-1.5"
              style={{ backgroundColor: "var(--status-building)" }}
            />
            {onlineCount} online
          </span>
        </div>
      </div>

      {/* ---- MAIN AREA ---- */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: STATUS BOARD */}
        <div className="flex-1 overflow-y-auto p-5">
          <h2 className="text-xs uppercase tracking-widest text-[var(--muted)] mb-4">
            Team Status
          </h2>
          {members.length === 0 ? (
            <p className="text-[var(--muted)] text-sm">No one here yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {members.map((m) => {
                const meta = STATUS_META[m.status] || STATUS_META.idle;
                const isMe = m.name === memberName;
                return (
                  <div
                    key={m.name}
                    className="rounded-lg p-4 border transition-colors"
                    style={{
                      backgroundColor: "var(--surface)",
                      borderColor: isMe ? "var(--accent)" : "var(--border)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: meta.color }}
                        />
                        <span className="font-medium">
                          {m.name}
                          {isMe && (
                            <span className="text-[var(--muted)] text-xs ml-2">(you)</span>
                          )}
                        </span>
                      </div>
                      <span className="text-xs text-[var(--muted)]">{timeAgo(m.lastUpdate)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-mono"
                        style={{
                          backgroundColor: meta.color + "22",
                          color: meta.color,
                        }}
                      >
                        {meta.label}
                      </span>
                      {m.workingOn && (
                        <span className="text-[var(--muted)] font-mono text-xs truncate">
                          {m.workingOn}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: ACTIVITY FEED */}
        <div className="w-80 border-l border-[var(--border)] flex flex-col">
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <h2 className="text-xs uppercase tracking-widest text-[var(--muted)]">
              Activity
            </h2>
          </div>
          <div ref={feedRef} className="flex-1 overflow-y-auto px-4 py-3">
            {room.events.length === 0 ? (
              <p className="text-[var(--muted)] text-xs">No activity yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {room.events.map((ev) => (
                  <div key={ev.id} className="text-sm">
                    <span className="text-[var(--muted)] text-xs mr-2 font-mono">
                      {formatTime(ev.timestamp)}
                    </span>
                    {ev.type === "join" ? (
                      <span className="text-[var(--muted)] italic">{ev.content}</span>
                    ) : ev.type === "status_update" ? (
                      <span>
                        <span className="font-medium">{ev.actor}</span>
                        <span className="text-[var(--muted)]"> updated: </span>
                        <span className="font-mono text-xs">{ev.content}</span>
                      </span>
                    ) : (
                      <span>
                        <span className="font-medium">{ev.actor}</span>
                        <span className="text-[var(--muted)]">: </span>
                        <span>{ev.content}</span>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---- BOTTOM CONTROLS ---- */}
      <div className="border-t border-[var(--border)] bg-[var(--surface)] px-5 py-3 flex flex-col gap-2">
        {/* Status row */}
        <div className="flex items-center gap-3">
          <select
            value={myStatus}
            onChange={(e) => setMyStatus(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
          >
            <option value="building">building</option>
            <option value="blocked">blocked</option>
            <option value="idle">idle</option>
            <option value="reviewing">reviewing</option>
            <option value="away">away</option>
          </select>
          <input
            type="text"
            placeholder="Working on..."
            value={myTask}
            onChange={(e) => setMyTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleStatusUpdate()}
            className="flex-1 px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] font-mono"
          />
          <button
            onClick={handleStatusUpdate}
            className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Update
          </button>
        </div>
        {/* Message row */}
        <form onSubmit={handleMessage} className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Quick message to team..."
            value={msgInput}
            onChange={(e) => setMsgInput(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)]"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[var(--border)] text-[var(--foreground)] text-sm hover:bg-[var(--muted)]/20 transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page wrapper with Suspense
// ---------------------------------------------------------------------------

export default function RoomPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen text-[var(--muted)]">
          Loading...
        </div>
      }
    >
      <RoomContent />
    </Suspense>
  );
}
