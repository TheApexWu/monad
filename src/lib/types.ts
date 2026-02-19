// ============================================
// KAMUI - Core Types
// ============================================

// --- Canvas Node Types ---

export type NodeType = "person" | "task" | "agent"

export type PersonData = {
  name: string
  status: "online" | "away" | "offline"
  currentFile?: string
  avatar?: string
}

export type TaskStatus = "pending" | "in_progress" | "done" | "blocked"

export type TaskData = {
  title: string
  status: TaskStatus
  owner?: string
  description?: string
  blockedBy?: string[]
  createdAt: number
  completedAt?: number
}

export type AgentStatus = "idle" | "running" | "paused" | "error" | "complete"

export type AgentData = {
  name: string
  status: AgentStatus
  owner: string
  progress?: string
  cost?: number
  tokenCount?: number
  logs: AgentLog[]
  startedAt: number
  completedAt?: number
}

export type AgentLogType = "llm_call" | "tool_use" | "reflection" | "error" | "output"

export type AgentLog = {
  timestamp: number
  type: AgentLogType
  content: string
  metadata?: Record<string, unknown>
}

// --- Timeline ---

export type TimelineEventType = "message" | "task_update" | "agent_action" | "system"

export type TimelineEvent = {
  id: string
  timestamp: number
  actor: string
  type: TimelineEventType
  content: string
}

// --- Room ---

export type Member = {
  id: string
  name: string
  status: "online" | "away" | "offline"
  currentFile?: string
  cursor?: { x: number; y: number }
  joinedAt: number
}

// --- Liveblocks Storage Schema ---
// This defines the shared state synced across all clients

export type Storage = {
  roomName: string
  nodes: Record<string, CanvasNode>
  edges: Record<string, CanvasEdge>
  timeline: TimelineEvent[]
}

export type CanvasNode = {
  id: string
  type: NodeType
  position: { x: number; y: number }
  data: PersonData | TaskData | AgentData
}

export type CanvasEdge = {
  id: string
  source: string
  target: string
  label?: string
  animated?: boolean
}

// --- Python SDK Messages (WebSocket Protocol) ---

export type SDKMessage =
  | { type: "agent_register"; agentId: string; name: string; owner: string; totalSteps?: number }
  | { type: "agent_update"; agentId: string; status: AgentStatus; progress?: string; cost?: number }
  | { type: "agent_log"; agentId: string; log: AgentLog }
  | { type: "agent_complete"; agentId: string }
  | { type: "timeline_message"; actor: string; content: string }
