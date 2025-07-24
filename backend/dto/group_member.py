from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class GroupMemberBase(BaseModel):
    group_id: UUID
    user_id: UUID

class GroupMemberCreate(GroupMemberBase):
    pass

class GroupMemberInDBBase(GroupMemberBase):
    id: UUID
    joined_at: datetime

    class Config:
        from_attributes = True

class GroupMember(GroupMemberInDBBase):
    pass
