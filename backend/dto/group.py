from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class GroupBase(BaseModel):
    name: str
    photo_url: Optional[str] = None

class GroupCreate(GroupBase):
    pass

class GroupInDBBase(GroupBase):
    id: UUID
    created_by: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class Group(GroupInDBBase):
    pass
