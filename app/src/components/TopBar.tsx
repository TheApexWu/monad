"use client";

// top bar showing room info and who's online

type Props = {
  roomId: string;
  memberName: string;
};

export default function TopBar({ roomId, memberName }: Props) {
  // TODO: hook up to liveblocks for real presence
  const members = [memberName]; // placeholder

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-center gap-3">
        <span className="font-bold text-sm tracking-wide">MONAD</span>
        <span className="text-[var(--muted)] text-xs">|</span>
        <span className="text-[var(--muted)] text-xs">{roomId}</span>
      </div>

      <div className="flex items-center gap-2">
        {members.map((m) => (
          <div key={m} className="flex items-center gap-1.5 text-xs">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>{m}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
