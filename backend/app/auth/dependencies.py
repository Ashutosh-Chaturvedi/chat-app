from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.database import get_db
from app.auth.service import decode_token, get_user_by_id
from app.models import User

bearer_scheme = HTTPBearer


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer()), 
    db: AsyncSession = Depends(get_db)
) -> User: 
    token = credentials.credentials
    payload = decode_token(token)
    
    if not payload or payload.get("type") != "access": 
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid or expired token",
        )
        
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
        )
        
    user = await get_user_by_id(db, uuid.UUID(user_id))
    if not user: 
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
        
    return user