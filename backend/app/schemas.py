from pydantic import BaseModel, EmailStr
import uuid
from datetime import datetime

class RoomCreate(BaseModel):
    name: str
    
class RoomOut(BaseModel): 
    id: uuid.UUID
    name: str
    code: str
    is_direct: bool
    created_at: datetime
    
    model_config = {"from_attributes": True}
    
class MessageCreate(BaseModel): 
    content: str
    
class MessageOut(BaseModel): 
    id: uuid.UUID
    content: str
    sender_id: uuid.UUID
    created_at: datetime
    
    model_config = {"from_attributes": True}

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    
    
class UserOut(BaseModel):
    id: uuid.UUID
    username: str
    email: str
    created_at: datetime
    
    model_config = {"from_attributes": True}
    
    
class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    
    
class RefreshRequest(BaseModel):
    refresh_token: str
    
    
