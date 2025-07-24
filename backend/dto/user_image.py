from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class UserImageBase(BaseModel):
    image_key: str
    is_active: bool

class UserImageCreate(UserImageBase):
    pass

class UserImageResponseDto(UserImageBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
