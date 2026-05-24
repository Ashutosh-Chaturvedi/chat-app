from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.database import get_db
from app.schemas import RoomCreate, RoomOut, MessageCreate, MessageOut
from app.auth import service
from app.auth.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/rooms", tags=["rooms"])

@router.post("/", response_model=RoomOut, status_code=201)
async def create_room(
    payload: RoomCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)    
):
    pass

@router.post("/{room_code}/members", response_model=RoomOut)
async def join_room(
    room_code: str, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)   
):
    pass

@router.post("/{room_id}/messages", response_model=MessageOut)
async def send_message(
    payload: MessageCreate, 
    room_id: uuid.UUID, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)       
):
    pass

@router.get("/{room_id}/messages", response_model=list[MessageOut])
async def get_room_messages(
    room_id: uuid.UUID, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)       
):
    pass
