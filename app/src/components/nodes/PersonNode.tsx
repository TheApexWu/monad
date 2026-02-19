"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

type PersonData = {
  name: string;
  status: "online" | "away" | "offline";
  currentFile?: string;
};

const statusColors: Record<string, string> = {
  online: "bg-green-500",
  away: "bg-yellow-500",
  offline: "bg-gray-500",
};

export default function PersonNode({ data }: NodeProps) {
  const d = data as unknown as PersonData;
  const color = statusColors[d.status] || "bg-gray-500";

  return (
    <div className="px-4 py-3 rounded-lg bg-[#1a1a1a] border border-[#333] min-w-[140px] shadow-lg">
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
        <span className="text-sm font-medium">{d.name}</span>
      </div>

      {d.currentFile && (
        <div className="text-xs text-[var(--muted)] font-mono">{d.currentFile}</div>
      )}

      <Handle type="source" position={Position.Right} className="!bg-[var(--accent)]" />
    </div>
  );
}
