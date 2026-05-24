from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.database import get_db
from app.schemas import RoomCreate, RoomOut, MessageCreate, MessageOut, UserOut
from app.auth import service
from app.auth.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/dms", tags=["dms"])

@router.post("/{user_id}", response_model=RoomOut)
async def initiate_dm(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)     
):
    pass

@router.get("/{user_id}/messages", response_model=list[MessageOut])
async def fetch_dm(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user) 
):
    pass