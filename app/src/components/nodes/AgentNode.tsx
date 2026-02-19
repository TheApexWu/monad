"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

type AgentData = {
  name: string;
  status: "idle" | "running" | "paused" | "error" | "complete";
  owner: string;
  progress?: string;
};

const statusColors: Record<string, string> = {
  idle: "bg-gray-500",
  running: "bg-blue-500 animate-pulse",
  paused: "bg-yellow-500",
  error: "bg-red-500",
  complete: "bg-green-500",
};

export default function AgentNode({ data }: NodeProps) {
  const d = data as unknown as AgentData;
  const color = statusColors[d.status] || "bg-gray-500";

  return (
    <div className="px-4 py-3 rounded-lg bg-[#1a1a1a] border border-[#333] min-w-[180px] shadow-lg">
      <Handle type="target" position={Position.Left} className="!bg-[var(--accent)]" />

      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs">🤖</span>
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-xs text-[var(--muted)] capitalize">{d.status}</span>
      </div>

      <div className="text-sm font-medium">{d.name}</div>

      {d.progress && (
        <div className="text-xs text-[var(--accent)] mt-1">{d.progress}</div>
      )}

      <div className="text-xs text-[var(--muted)] mt-1">by {d.owner}</div>

      <button className="text-xs text-[var(--accent)] mt-2 hover:underline">
        View Logs
      </button>

      <Handle type="source" position={Position.Right} className="!bg-[var(--accent)]" />
    </div>
  );
}
