from pydantic import BaseModel, EmailStr
import uuid
from datetime import datetime


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
    
    
