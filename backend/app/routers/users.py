from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.database import get_db
from app.schemas import RoomCreate, RoomOut, MessageCreate, MessageOut, UserOut
from app.auth import service as a_serve
from app.routers import service as r_serve
from app.auth.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me/rooms", response_model=list[RoomOut])
async def list_my_rooms(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)  
):
    return await r_serve.get_user_rooms(db, current_user)

@router.get("/{user_id}", response_model=UserOut)
async def get_user_detail(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)  
):
    user = await a_serve.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user