"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

type TaskData = {
  title: string;
  status: "pending" | "in_progress" | "done" | "blocked";
  owner?: string;
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  in_progress: "bg-blue-500",
  done: "bg-green-500",
  blocked: "bg-red-500",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  done: "Done",
  blocked: "Blocked",
};

export default function TaskNode({ data }: NodeProps) {
  const d = data as unknown as TaskData;
  const color = statusColors[d.status] || "bg-gray-500";

  return (
    <div className="px-4 py-3 rounded-lg bg-[#1a1a1a] border border-[#333] min-w-[160px] shadow-lg">
      <Handle type="target" position={Position.Left} className="!bg-[var(--accent)]" />

      <div className="flex items-center gap-2 mb-1">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-xs text-[var(--muted)]">{statusLabels[d.status]}</span>
      </div>

      <div className="text-sm font-medium">{d.title}</div>

      {d.owner && (
        <div className="text-xs text-[var(--muted)] mt-1">{d.owner}</div>
      )}

      <Handle type="source" position={Position.Right} className="!bg-[var(--accent)]" />
    </div>
  );
}
