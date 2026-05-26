from fastapi import WebSocket
import uuid
from collections import defaultdict

class ConnectionManager:
    def __init__(self):
        self.data: defaultdict[uuid.UUID, list[WebSocket]] = defaultdict(list)
        
    async def connect(self, room_id: uuid.UUID, websocket: WebSocket):
        await websocket.accept()
        self.data[room_id].append(websocket)
        
    def disconnect(self, room_id: uuid.UUID, websocket: WebSocket):
        self.data[room_id].remove(websocket)
        
    async def broadcast(self, room_id: uuid.UUID, message: str):
        sockets = self.data[room_id]
        for socket in sockets:
            await socket.send_text(message)
            
manager = ConnectionManager()