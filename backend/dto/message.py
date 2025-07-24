from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class MessageBase(BaseModel):
    content: str
    is_encrypted: bool

class MessageCreate(MessageBase):
    sender_id: UUID
    receiver_id: Optional[UUID] = None # For private messages
    group_id: Optional[UUID] = None # For group messages

class MessageInDBBase(MessageBase):
    id: UUID
    sender_id: UUID
    receiver_id: Optional[UUID] = None
    group_id: Optional[UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True

class Message(MessageInDBBase):
    pass
