from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class ConversationBase(BaseModel):
    user1_id: UUID
    user2_id: UUID

class ConversationCreate(ConversationBase):
    pass

class ConversationInDBBase(ConversationBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class Conversation(ConversationInDBBase):
    pass

class ConversationResponseDto(ConversationInDBBase):
    pass
