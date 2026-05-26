import asyncio
import websockets
import json

async def client(name, token, room_id):
    uri = f"ws://localhost:8000/ws/{room_id}?token={token}"
    async with websockets.connect(uri) as ws:
        print(f"{name} connected")
        await ws.send(f"hello from {name}")
        response = await ws.recv()
        print(f"{name} received: {response}")

async def test():
    room_id = "b4a8521b-5ec8-4223-86cb-ddcb615e6826"
    token1 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzYzdjNmVmOC03NDM2LTQ4ZmQtYjhjYS02YjYzZGQxODNmYzEiLCJleHAiOjE3Nzk4MjYxNzAsInR5cGUiOiJhY2Nlc3MifQ.yhQOFBOgOZ4ptktsVlCJV1oAVd1gRs80rSrGJ7kXq30"
    token2 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmYTkyMWZiMS00NDcyLTQ1OWUtOGQxNS05MGMyZmE5ZTIyNzkiLCJleHAiOjE3Nzk4MjYxOTMsInR5cGUiOiJhY2Nlc3MifQ.6XxQjVb_nwjcm5MjxW3LETKbpqn7MXS8ySU0fbJFZ18"
    
    await asyncio.gather(
        client("user1", token1, room_id),
        client("user2", token2, room_id),
    )

asyncio.run(test())