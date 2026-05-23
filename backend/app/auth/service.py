from datetime import datetime, timedelta, timezone
from typing import Optional
import uuid
import hashlib
import base64
import bcrypt

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.models import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12, bcrypt__ident="2b")


# Password utilites

def _prehash(password: str) -> str:
    digest = hashlib.sha256(password.encode()).digest()
    return base64.b64encode(digest).decode()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(
        _prehash(password).encode(),
        bcrypt.gensalt(rounds=12)
    ).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(
        _prehash(plain).encode(),
        hashed.encode()
    )


# JWT utitlites

def create_access_token(user_id: uuid.UUID) -> str: 
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {"sub": str(user_id), "exp": expire, "type": "access"}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(user_id: uuid.UUID) -> str: 
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    payload = {"sub": str(user_id), "exp": expire, "type": "refresh"}
    return jwt.encode(payload, settings.SECRET_KEY, settings.ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try: 
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None
    

# Database operations

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]: 
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()

async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> Optional[User]:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()

async def create_user(db: AsyncSession, username: str, email: str, password: str) -> User: 
    user = User(
        username = username,
        email = email ,
        password_hash = hash_password(password),
    )        
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

async def authenticate_user(db: AsyncSession, email: str, password: str) -> Optional[User]: 
    user = await(get_user_by_email(db, email))
    if not user: 
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user
