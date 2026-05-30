import asyncio
import websockets

async def test():
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmYTkyMWZiMS00NDcyLTQ1OWUtOGQxNS05MGMyZmE5ZTIyNzkiLCJleHAiOjE3ODAxMjQxMTIsInR5cGUiOiJhY2Nlc3MifQ.hRe44fKNwpF1dGV6KzBCcDRwIBZ3UdyWC2GJbtXBcGY"
    room_id = "b4a8521b-5ec8-4223-86cb-ddcb615e6826"
    uri = f"ws://localhost:8000/ws/{room_id}?token={token}"
    
    async with websockets.connect(uri) as ws:
        await ws.send("test receipt message")
        response = await ws.recv()
        print(response)

asyncio.run(test())