# MONAD

**Monitor. Orchestrate. Navigate. Assign. Deploy.**

## The Name

Two layers.

**The acronym:** Monitor what's happening. Orchestrate your team. Navigate the project state. Assign tasks. Deploy agents. Five verbs. The complete hackathon workflow.

**The philosophy:** Leibniz's monad is an indivisible unit that reflects the entire universe from its own perspective. Each teammate is a monad: self-contained, working independently, but perceiving the whole project state without friction. The war room itself is a monad: one indivisible view of everything. No fragments. No blind spots. The whole picture from any seat.

Leibniz wrote that monads have "no windows" through which anything could enter or leave. In MONAD, the canvas IS the window. Every agent, every task, every teammate visible on one surface. The indivisible project, made visible.

## What It Is

A shared real-time canvas where hackathon teammates see everything: who's working on what, what agents are running, what they're doing, and what the team needs next. One link to join. Zero setup friction. The war room you wish you had at every hackathon.

## The Problem

Hackathon teams waste 30-40% of their build time on coordination, not building:
- "I thought you were doing that" (unclear task ownership)
- Two people build the same thing without knowing (wasted parallel work)
- "What's the agent doing?" (opaque AI processes)
- Merge conflicts from touching the same files (no spatial awareness of who's working where)
- Context switching between Slack/Discord, GitHub, task boards, terminals (fragmented tools)
- No shared mental model of the project's current state

The existing tools (GitHub, Slack, Notion, Linear) are designed for week-long sprints, not 5-hour builds. They're too heavy, too async, and too fragmented for hackathon speed.

## The Solution

One URL. One canvas. Everything visible.

### Core Views

**1. The Canvas (Primary View)**
A React Flow node graph showing the project's live state:

```
┌─────────────────────────────────────────────────────┐
│  MONAD                   Room: crucible-hack-feb21  │
│  ┌──────┐     ┌──────┐     ┌──────┐                │
│  │Amadeus│────>│Engine│────>│ Demo │<────┌──────┐   │
│  │🟢 live│     │✅ done│     │🔨 WIP│     │ Evan │   │
│  └──────┘     └──────┘     └──────┘     │🟢 live│   │
│       │                        │         └──────┘   │
│       v                        v                    │
│  ┌──────────┐          ┌───────────┐                │
│  │🤖 Agent: │          │🤖 Agent:  │                │
│  │Run 100   │          │Build UI   │                │
│  │rounds    │          │components │                │
│  │⏳ Rd 47  │          │✅ Complete │                │
│  │[view log]│          │[view log] │                │
│  └──────────┘          └───────────┘                │
│                                                     │
│  ─────────── TIMELINE ──────────────                │
│  11:02 Amadeus: created game engine                 │
│  11:15 Evan: started Streamlit scaffold             │
│  11:34 Agent(amadeus): running self-play round 1... │
│  11:35 Agent(amadeus): round 1 complete, both split │
│  ...                                                │
└─────────────────────────────────────────────────────┘
```

Node types:
- **Person nodes** (team members): show online status, current focus, cursor activity
- **Task nodes**: show status (pending/WIP/done), owner, blockers
- **Agent nodes**: show real-time status, current action, progress, expandable logs
- **Dependency edges**: show which tasks block which, data flow between components

Drag to rearrange. Click to expand. Double-click agent node to see full log stream.

**2. The Agent Inspector (Side Panel)**
Click any agent node to see:
- Real-time streaming log of actions (tool calls, LLM responses, file writes)
- Token usage and cost
- Current context/state
- Controls: pause, redirect, kill, restart
- Full trace history (waterfall view like AgentOps)

```
┌─ Agent: Self-Play Engine ──────────────┐
│ Status: Running (Round 47/100)         │
│ Cost: $0.82 | Tokens: 412K            │
│ Started: 2:15 PM | ETA: 2:45 PM       │
│                                        │
│ ┌─ Round 47 ─────────────────────────┐ │
│ │ 2:31:02 Agent A conversation...    │ │
│ │ 2:31:04 Agent B conversation...    │ │
│ │ 2:31:05 Agent A chose: STEAL      │ │
│ │ 2:31:05 Agent B chose: SPLIT      │ │
│ │ 2:31:06 Computing metrics...       │ │
│ │ 2:31:07 Agent A reflecting...      │ │
│ │ 2:31:08 Agent B reflecting...      │ │
│ │ 2:31:09 Round 47 complete.         │ │
│ └────────────────────────────────────┘ │
│                                        │
│ [⏸ Pause] [🔄 Restart] [⏹ Kill]      │
└────────────────────────────────────────┘
```

**3. The Team Pulse (Top Bar)**
Compact team presence bar:
```
🟢 Amadeus (engine/game.py) | 🟢 Evan (demo/app.py) | 🟡 Agent: Self-Play (rd 47) | 🟡 Agent: UI Build (styling)
```
Shows at a glance: who's online, what file they're in, what agents are running.

**4. The Quick Chat (Overlay)**
Minimal chat overlay. Not Slack. Not Discord. Just short messages pinned to the timeline:
- "Engine done, starting self-play run"
- "UI skeleton ready, need metrics data format"
- "Leaving at 4:00, writing your cheat sheet now"

Messages appear in the timeline alongside agent activity. One unified stream of human + agent actions.

## What Makes MONAD Different From Existing Tools

| Tool | What it does | What it doesn't do |
|------|-------------|-------------------|
| GitHub | Code versioning | No real-time awareness of who's doing what |
| Slack/Discord | Communication | No project state, no agent visibility |
| Linear/Notion | Task tracking | Too heavy for 5-hour builds, no agent integration |
| Figma | Real-time multiplayer design | Not for code or agents |
| VS Code Live Share | Collaborative coding | No project-level overview, no agent visibility |
| LangGraph Studio | Agent debugging | Single-user, not multiplayer |

MONAD combines: Figma's multiplayer presence + Linear's task tracking + AgentOps' agent observability + a shared canvas. In one tool. For hackathon-speed teams.

## Technical Architecture

### Stack
- **Next.js 14** (App Router)
- **React Flow** - Node graph visualization (MIT license, used by LangFlow/Flowise)
- **Liveblocks** - Real-time multiplayer (presence, shared state, conflict resolution)
  - Handles: cursor positions, who's online, shared document state
  - No custom WebSocket server needed
  - Free tier: 100 MAU, enough for hackathon use
- **Supabase** - Backend (auth, database, room persistence)
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library

### Why Liveblocks Over Raw WebSockets
Figma-style multiplayer from scratch takes weeks. Liveblocks gives you:
- Presence (who's online, cursor positions) out of the box
- Shared state with conflict resolution (CRDT-based)
- Room management (create/join via link)
- React hooks API (`useMyPresence`, `useOthers`, `useStorage`)
Build time: hours instead of weeks.

### Data Model

```typescript
// Room state (shared via Liveblocks Storage)
type Room = {
  id: string
  name: string           // "crucible-hack-feb21"
  createdAt: number
  members: Member[]
  nodes: Map<string, CanvasNode>  // React Flow nodes
  edges: Map<string, CanvasEdge>  // React Flow edges
  timeline: TimelineEvent[]       // Unified activity stream
}

type Member = {
  id: string
  name: string
  avatar?: string
  status: "online" | "away" | "offline"
  currentFile?: string   // What file they're editing
  cursor?: { x: number, y: number }  // Canvas cursor position
}

type CanvasNode = {
  id: string
  type: "person" | "task" | "agent"
  position: { x: number, y: number }
  data: PersonData | TaskData | AgentData
}

type TaskData = {
  title: string
  status: "pending" | "in_progress" | "done" | "blocked"
  owner?: string         // Member ID
  description?: string
  blockedBy?: string[]   // Task IDs
}

type AgentData = {
  name: string
  status: "idle" | "running" | "paused" | "error" | "complete"
  owner: string          // Who spawned it
  progress?: string      // "Round 47/100"
  cost?: number          // Running token cost
  logs: AgentLog[]       // Streaming action log
  startedAt: number
}

type AgentLog = {
  timestamp: number
  type: "llm_call" | "tool_use" | "reflection" | "error" | "output"
  content: string
  metadata?: Record<string, any>  // tokens, latency, etc.
}

type TimelineEvent = {
  timestamp: number
  actor: string          // Member name or agent name
  type: "message" | "task_update" | "agent_action" | "system"
  content: string
}
```

### Agent Integration Pattern

Agents running locally on a teammate's machine report status to MONAD via a lightweight Python SDK:

```python
from monad import MonadClient

# Connect to room
monad = MonadClient(room="crucible-hack-feb21", member="amadeus")

# Register an agent
agent = monad.register_agent(name="Self-Play Engine", total_steps=100)

# Report progress (appears on canvas in real-time)
for round_n in range(100):
    agent.update(status="running", progress=f"Round {round_n}/100")
    agent.log(f"Agent A conversation: {a_msg}")
    agent.log(f"Agent B chose: {b_choice}")
    agent.log(f"Round {round_n} complete", type="output")

agent.update(status="complete")
```

This SDK sends events to MONAD's backend via WebSocket. The canvas updates in real-time for all team members. Evan sees Amadeus's self-play agent progressing on the shared canvas without asking.

### Room Creation Flow
1. Creator hits monad.app (or localhost during hackathon)
2. Enters room name: "crucible-hack-feb21"
3. Gets shareable link: monad.app/room/crucible-hack-feb21
4. Teammates click link, enter name, join canvas
5. Everyone sees the same canvas. Drag nodes, spawn agents, post messages.

## Build Plan (1-2 Days)

### Day 1 (Core, 6-8 hours)
- [ ] Next.js project setup with React Flow + Liveblocks + Tailwind
- [ ] Room creation and join flow (link-based, no auth for hackathon speed)
- [ ] Canvas with draggable task nodes (create, edit status, assign owner)
- [ ] Team presence bar (who's online, current file)
- [ ] Unified timeline (human messages + task updates)
- [ ] Basic styling (dark theme, clean layout)

### Day 2 (Agent Layer + Polish, 6-8 hours)
- [ ] Python SDK for agent reporting (monad-py package)
- [ ] Agent nodes on canvas with real-time status streaming
- [ ] Agent inspector side panel (expand to see logs)
- [ ] Agent controls (pause/kill from canvas)
- [ ] Edge connections (task dependencies, agent-to-task relationships)
- [ ] Polish: animations, responsive layout, empty states

### Stretch Goals
- [ ] Cursor presence on canvas (see teammate's cursor like Figma)
- [ ] Agent cost tracking (token usage displayed on node)
- [ ] Room persistence (reconnect and see history)
- [ ] Export: download timeline as markdown for post-hackathon retrospective
- [ ] Voice channel integration (embed a Discord/Livekit voice widget)

## Design Principles

1. **One glance = full picture.** If a teammate needs to ask "what are you working on?", the tool failed.
2. **Agents are first-class citizens.** They appear on the canvas like teammates. Their actions appear in the timeline like human messages.
3. **Zero setup friction.** Click a link, enter your name, you're in. No accounts, no installs, no config.
4. **Hackathon speed, not enterprise weight.** No sprints, no story points, no backlog grooming. Tasks are sticky notes, not Jira tickets.
5. **The timeline is the truth.** Every action (human or agent) in one chronological stream. No context switching between tools.
