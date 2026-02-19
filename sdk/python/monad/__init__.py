"""
MONAD Python SDK - Report agent status to your hackathon war room.

Monitor. Orchestrate. Navigate. Assign. Deploy.

Usage:
    from monad import MonadClient

    client = MonadClient(room="my-hackathon", member="amadeus")
    agent = client.register_agent(name="Self-Play Engine", total_steps=100)

    for i in range(100):
        agent.update(status="running", progress=f"Round {i}/100")
        agent.log(f"Processing round {i}")

    agent.complete()
"""

from monad.client import MonadClient, MonadAgent

__all__ = ["MonadClient", "MonadAgent"]
__version__ = "0.1.0"
