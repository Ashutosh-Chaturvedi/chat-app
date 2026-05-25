from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.database import get_db
from app.schemas import RoomCreate, RoomOut, MessageCreate, MessageOut
from app.routers import service
from app.auth.dependencies import get_current_user
from app.models import User

from app.models import Room, RoomMember, User, Message
from sqlalchemy import select, asc

router = APIRouter(prefix="/rooms", tags=["rooms"])

@router.post("/", response_model=RoomOut, status_code=201)
async def create_room(
    payload: RoomCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)    
):
    return await service.create_room(db, payload.name, current_user)

@router.post("/{room_code}/members", response_model=RoomOut)
async def join_room(
    room_code: str, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)   
):
    room = await service.join_room(db, room_code, current_user)
    if room is None: 
        raise HTTPException(status_code=404, detail="Room not found")
    return room

@router.post("/{room_id}/messages", response_model=MessageOut)
async def send_message(
    payload: MessageCreate, 
    room_id: uuid.UUID, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)       
):  
    result = await db.execute(
        select(RoomMember).where(
            RoomMember.room_id == room_id,
            RoomMember.user_id == current_user.id
        )
    )
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this room")
    return await service.send_message(db, room_id, current_user, payload.content)

@router.get("/{room_id}/messages", response_model=list[MessageOut])
async def get_room_messages(
    room_id: uuid.UUID, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)       
):
    return await service.get_room_message(db, room_id, current_user)
