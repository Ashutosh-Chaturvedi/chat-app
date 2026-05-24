from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.database import get_db
from app.schemas import RoomCreate, RoomOut, MessageCreate, MessageOut, UserOut
from app.auth import service
from app.auth.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me/rooms", response_model=list[RoomOut])
async def list_my_rooms(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)  
):
    pass

@router.get("/{user_id}", response_model=UserOut)
async def get_user_detail(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)  
):
    pass