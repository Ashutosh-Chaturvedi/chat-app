from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from fastapi import WebSocket
from sqlalchemy import select
from app.models import RoomMember, Message
import json


from app.websockets import manager
from app.database import get_db
from app.auth.service import decode_token, get_user_by_id
from app.routers.service import send_message


router = APIRouter(prefix="/ws", tags=["ws"])

@router.websocket("/{room_id}")
async def websocket_endpoint(
    room_id: uuid.UUID,
    websocket: WebSocket,
    token: str,
    db: AsyncSession = Depends(get_db)
):
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        await websocket.close(code=4001)
        return

    user = await get_user_by_id(db, uuid.UUID(payload["sub"]))
    if not user:
        await websocket.close(code=4001)
        return
    
    result = await db.execute(
        select(RoomMember).where(
            RoomMember.room_id == room_id,
            RoomMember.user_id == user.id
        )
    )
    if not result.scalar_one_or_none():
        await websocket.close(code=4003)
        return
    
    await manager.connect(room_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            
            message = await send_message(db, room_id, user, data)
            
            await manager.broadcast(room_id, json.dumps({
                "id": str(message.id),
                "sender_id": str(message.sender_id),
                "content": message.content,
                "created_at": message.created_at.isoformat()
            }))
    except Exception:
        manager.disconnect(room_id, websocket)

