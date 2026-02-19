# MONAD

**Monitor. Orchestrate. Navigate. Assign. Deploy.**

A shared real-time canvas where hackathon teammates see everything: who's working on what, what agents are running, what they're doing, and what the team needs next.

One link to join. Zero setup friction.

## What it does

- Shared node graph canvas (React Flow) showing tasks, agents, and team members
- Real-time timeline of human + agent activity
- Python SDK for agents to report status in 4 lines
- Team presence bar (who's online, what file they're in)

## Stack

- Next.js 15 + TypeScript
- React Flow (node graph)
- Tailwind CSS
- Python SDK (websocket + http fallback)

## Getting started

```bash
cd app
npm install
npm run dev
```

Open http://localhost:3000, enter a room name and your name.

## Python SDK

```python
from monad import MonadClient

client = MonadClient(room="my-hackathon", member="amadeus")
agent = client.register_agent(name="Self-Play Engine", total_steps=100)

for i in range(100):
    agent.update(status="running", progress=f"Round {i}/100")
    agent.log(f"Processing round {i}")

agent.complete()
```

## Why

Hackathon teams waste 30-40% of their build time on coordination, not building. Existing tools (GitHub, Slack, Notion, Linear) are designed for week-long sprints, not 5-hour builds. MONAD puts everything on one canvas.
