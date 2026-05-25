from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.database import get_db
from app.schemas import RoomCreate, RoomOut, MessageCreate, MessageOut, UserOut
from app.auth import service as a_serve
from app.routers import service as r_serve
from app.auth.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/dms", tags=["dms"])

@router.post("/{user_id}", response_model=RoomOut)
async def initiate_dm(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)     
):
    receiver = await a_serve.get_user_by_id(db, user_id)
    if not receiver:
        raise HTTPException(status_code=404, detail="User not found")
    return await r_serve.initiate_dm(db, receiver, current_user)

@router.get("/{user_id}/messages", response_model=list[MessageOut])
async def fetch_dm(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user) 
):
    room = await r_serve.get_dm_room(db, user1_id=user_id, user2_id=current_user.id)
    
    if not room:
        raise HTTPException(status_code=404, detail="No DM exists")
    
    messages = await r_serve.get_room_message(db, room.id, current_user)
    return messages