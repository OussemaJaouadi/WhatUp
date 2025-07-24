from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from enum import Enum
from typing import Optional

class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str # Password will be hashed before saving

class UserInDBBase(UserBase):
    id: UUID
    created_at: datetime
    role: UserRole
    active_avatar_url: Optional[str] = None
    public_key: Optional[str] = None

    class Config:
        from_attributes = True

class User(UserInDBBase):
    pass

class UserResponseDto(BaseModel):
    id: UUID
    username: str
    email: EmailStr
    active_avatar_url: Optional[str] = None
    public_key: Optional[str] = None
    created_at: datetime

class UserResponseAdminDto(UserResponseDto):
    role: UserRole

class UserUpdatePublicKey(BaseModel):
    public_key: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserAdminEdit(BaseModel):
    role: Optional[UserRole] = None
    account_confirmed: Optional[bool] = None