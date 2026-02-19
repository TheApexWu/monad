"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";

export default function Home() {
  const router = useRouter();
  const [roomName, setRoomName] = useState("");
  const [memberName, setMemberName] = useState("");

  function handleCreate() {
    const id = roomName.trim() || nanoid(8);
    const name = memberName.trim() || "anon";
    router.push(`/room?id=${id}&name=${name}`);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-2">MONAD</h1>
        <p className="text-[var(--muted)] text-sm tracking-widest uppercase">
          Monitor. Orchestrate. Navigate. Assign. Deploy.
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <input
          type="text"
          placeholder="Room name (or leave blank for random)"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)]"
        />
        <input
          type="text"
          placeholder="Your name"
          value={memberName}
          onChange={(e) => setMemberName(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)]"
        />
        <button
          onClick={handleCreate}
          className="w-full py-3 rounded-lg bg-[var(--accent)] text-white font-medium hover:opacity-90 transition-opacity"
        >
          Enter War Room
        </button>
      </div>

      <p className="text-[var(--muted)] text-xs max-w-md text-center">
        One link. One canvas. Everything visible. Share the room name with your
        teammates so they can join the same war room.
      </p>
    </div>
  );
}
