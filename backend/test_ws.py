import asyncio
import websockets
import httpx

async def test():
    room_id = "b4a8521b-5ec8-4223-86cb-ddcb615e6826"
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmYTkyMWZiMS00NDcyLTQ1OWUtOGQxNS05MGMyZmE5ZTIyNzkiLCJleHAiOjE3Nzk5NzUxMjAsInR5cGUiOiJhY2Nlc3MifQ.kYyhKe3d2xFDD1wbqEHgiezm2EAJqf0dJrhk4_xBxjQ"
    user_id = "fa921fb1-4472-459e-8d15-90c2fa9e2279"
    
    async with websockets.connect(
        f"ws://localhost:8000/ws/{room_id}?token={token}"
    ) as ws:
        await ws.send("ping")
        pong = await ws.recv()
        print(f"heartbeat: {pong}")
        
        async with httpx.AsyncClient() as client:
            r = await client.get(
                f"http://localhost:8000/users/{user_id}/presence",
                headers={"Authorization": f"Bearer {token}"}
            )
            print(f"while connected: {r.json()}")
    
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"http://localhost:8000/users/{user_id}/presence",
            headers={"Authorization": f"Bearer {token}"}
        )
        print(f"after disconnect: {r.json()}")

asyncio.run(test())