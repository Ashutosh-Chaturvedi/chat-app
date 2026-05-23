from datetime import datetime, timedelta, timezone
from typing import Optional
import uuid

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.models import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Password utilites

def hash_password(password: str) -> str: 
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool: 
    return pwd_context.verify(plain, hashed)

