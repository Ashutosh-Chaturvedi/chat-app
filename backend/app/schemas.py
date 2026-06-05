from pydantic import BaseModel, EmailStr, Field
import uuid
from datetime import datetime

class RoomCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    
class RoomOut(BaseModel): 
    id: uuid.UUID
    name: str
    code: str
    is_direct: bool
    created_at: datetime
    created_by: uuid.UUID
    member_count: int | None
    last_message: str | None = None
    last_activity: datetime | None = None
    
    model_config = {"from_attributes": True}
    
class MessageCreate(BaseModel): 
    content: str = Field(min_length=1, max_length=4000)
    
class MessageOut(BaseModel): 
    id: uuid.UUID
    content: str
    sender_id: uuid.UUID
    sender_username: str
    created_at: datetime

class UserRegister(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8, max_length=100)
    

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
    
class RoomMemberOut(BaseModel):
    id: uuid.UUID
    username: str
    online: bool

    model_config = {"from_attributes": True}
    
    
