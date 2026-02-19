"use client";

import { useCallback, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import TaskNode from "./nodes/TaskNode";
import AgentNode from "./nodes/AgentNode";
import PersonNode from "./nodes/PersonNode";

const nodeTypes = {
  task: TaskNode,
  agent: AgentNode,
  person: PersonNode,
};

type Props = {
  roomId: string;
  memberName: string;
};

// some starter nodes so the canvas isn't empty
const defaultNodes: Node[] = [
  {
    id: "person-1",
    type: "person",
    position: { x: 100, y: 200 },
    data: { name: "You", status: "online", currentFile: "" },
  },
  {
    id: "task-1",
    type: "task",
    position: { x: 350, y: 100 },
    data: { title: "Example task", status: "pending", owner: "" },
  },
  {
    id: "agent-1",
    type: "agent",
    position: { x: 350, y: 300 },
    data: {
      name: "Example Agent",
      status: "idle",
      owner: "You",
      progress: "",
    },
  },
];

const defaultEdges: Edge[] = [
  { id: "e-person-task", source: "person-1", target: "task-1", animated: true },
  { id: "e-person-agent", source: "person-1", target: "agent-1" },
];

export default function Canvas({ roomId, memberName }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges]
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#262626" gap={20} />
        <Controls className="!bg-[var(--surface)] !border-[var(--border)]" />
        <MiniMap
          nodeColor="#3b82f6"
          maskColor="rgba(0,0,0,0.7)"
          className="!bg-[var(--surface)]"
        />
      </ReactFlow>
    </div>
  );
}
