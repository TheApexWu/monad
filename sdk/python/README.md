# MONAD Python SDK

Report agent activity to your MONAD war room in 4 lines.

## Install

```bash
pip install websocket-client requests
```

## Usage

```python
from monad import MonadClient

# Connect to your war room
client = MonadClient(room="crucible-hack-feb21", member="amadeus")

# Register an agent (appears as a node on the shared canvas)
agent = client.register_agent(name="Self-Play Engine", total_steps=100)

# Report progress (updates canvas in real-time for all teammates)
for round_n in range(100):
    agent.update(status="running", progress=f"Round {round_n}/100")
    agent.log(f"Agent A chose STEAL, Agent B chose SPLIT")
    agent.log(f"Round {round_n} metrics computed", log_type="output")

# Mark complete
agent.complete()

# Send a message to the team timeline
client.message("Self-play done. 100 rounds logged. Starting metrics analysis.")
```

## What Your Teammates See

When you register an agent and send updates, a live node appears on the shared MONAD canvas:

```
+---------------------+
| Self-Play Engine     |
| Status: Running      |
| Progress: Rd 47/100  |
| Owner: amadeus       |
| [View Logs]          |
+---------------------+
```

Clicking "View Logs" opens the agent inspector with your streaming log entries.

## Log Types

```python
agent.log("Calling Gemini API", log_type="llm_call")
agent.log("Writing to results.json", log_type="tool_use")
agent.log("Agent A reflection: bluffing detected", log_type="reflection")
agent.log("API timeout, retrying", log_type="error")
agent.log("Round complete: A=$50, B=$0", log_type="output")
```
