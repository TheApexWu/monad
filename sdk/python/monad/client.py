"""
MONAD Python SDK Client

Lightweight client that reports agent activity to a MONAD war room.
Uses WebSocket for real-time updates. Falls back to HTTP polling if WS unavailable.
"""

import json
import time
import threading
from dataclasses import dataclass, field
from typing import Optional, Literal
from uuid import uuid4

try:
    import websocket
    HAS_WEBSOCKET = True
except ImportError:
    HAS_WEBSOCKET = False

try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False


AgentStatus = Literal["idle", "running", "paused", "error", "complete"]
LogType = Literal["llm_call", "tool_use", "reflection", "error", "output"]


@dataclass
class MonadAgent:
    """Represents a registered agent in the war room."""
    client: "MonadClient"
    agent_id: str
    name: str
    total_steps: Optional[int] = None

    def update(self, status: AgentStatus, progress: Optional[str] = None, cost: Optional[float] = None):
        """Update agent status on the canvas."""
        self.client._send({
            "type": "agent_update",
            "agentId": self.agent_id,
            "status": status,
            "progress": progress,
            "cost": cost,
        })

    def log(self, content: str, log_type: LogType = "output", metadata: Optional[dict] = None):
        """Send a log entry that appears in the agent inspector."""
        self.client._send({
            "type": "agent_log",
            "agentId": self.agent_id,
            "log": {
                "timestamp": int(time.time() * 1000),
                "type": log_type,
                "content": content,
                "metadata": metadata or {},
            }
        })

    def complete(self):
        """Mark agent as complete."""
        self.client._send({
            "type": "agent_complete",
            "agentId": self.agent_id,
        })


class MonadClient:
    """
    Connect to a MONAD war room and report agent activity.

    Args:
        room: Room ID (e.g., "crucible-hack-feb21")
        member: Your display name
        server: MONAD server URL (default: localhost:3000 for dev)
    """

    def __init__(self, room: str, member: str, server: str = "http://localhost:3000"):
        self.room = room
        self.member = member
        self.server = server
        self.ws_url = server.replace("http", "ws") + f"/api/ws?room={room}&member={member}"
        self._ws: Optional[websocket.WebSocketApp] = None
        self._connected = False
        self._message_queue: list[dict] = []

        if HAS_WEBSOCKET:
            self._connect_ws()

    def _connect_ws(self):
        """Establish WebSocket connection to Kamui server."""
        def on_open(ws):
            self._connected = True
            # Flush queued messages
            for msg in self._message_queue:
                ws.send(json.dumps(msg))
            self._message_queue.clear()

        def on_close(ws, code, reason):
            self._connected = False

        def on_error(ws, error):
            print(f"[monad] WebSocket error: {error}")

        self._ws = websocket.WebSocketApp(
            self.ws_url,
            on_open=on_open,
            on_close=on_close,
            on_error=on_error,
        )
        # Run in background thread
        t = threading.Thread(target=self._ws.run_forever, daemon=True)
        t.start()

    def _send(self, message: dict):
        """Send a message to the Kamui server."""
        message["room"] = self.room
        message["member"] = self.member
        message["timestamp"] = int(time.time() * 1000)

        if self._connected and self._ws:
            self._ws.send(json.dumps(message))
        elif HAS_REQUESTS:
            # Fallback: HTTP POST
            try:
                requests.post(
                    f"{self.server}/api/events",
                    json=message,
                    timeout=2,
                )
            except Exception:
                self._message_queue.append(message)
        else:
            self._message_queue.append(message)

    def register_agent(self, name: str, total_steps: Optional[int] = None) -> MonadAgent:
        """
        Register a new agent on the war room canvas.
        Returns a MonadAgent instance for reporting updates.
        """
        agent_id = f"agent-{uuid4().hex[:8]}"

        self._send({
            "type": "agent_register",
            "agentId": agent_id,
            "name": name,
            "owner": self.member,
            "totalSteps": total_steps,
        })

        return MonadAgent(
            client=self,
            agent_id=agent_id,
            name=name,
            total_steps=total_steps,
        )

    def message(self, content: str):
        """Send a message to the team timeline."""
        self._send({
            "type": "timeline_message",
            "actor": self.member,
            "content": content,
        })

    def close(self):
        """Close the connection."""
        if self._ws:
            self._ws.close()
