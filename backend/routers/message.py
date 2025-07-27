from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from core.database import AsyncSessionLocal
from services.message_service import MessageService
from dto.message import MessageCreate, Message
from models.user import User
from utils.decorators import requires_auth

class MessageRoutes:
    def __init__(self, message_service: MessageService):
        self.message_service = message_service
        self.router = APIRouter(prefix="/messages", tags=["Messages"])
        self.router.add_api_route(
            "/send", self.send_message, methods=["POST"], response_model=Message
        )
        self.router.add_api_route(
            "/conversation/{conversation_id}", self.get_messages_for_conversation, methods=["GET"], response_model=List[Message]
        )
        self.router.add_api_route(
            "/group/{group_id}", self.get_messages_for_group, methods=["GET"], response_model=List[Message]
        )
        self.router.add_api_route(
            "/{message_id}/read", self.mark_message_read, methods=["POST"], response_model=dict
        )
        self.router.add_api_route(
            "/{message_id}", self.delete_message, methods=["DELETE"], response_model=dict
        )
    @requires_auth
    async def mark_message_read(
        self,
        message_id: UUID,
        request: Request,
        db: AsyncSession = Depends(AsyncSessionLocal)
    ) -> dict:
        current_user = request.state.user
        await self.message_service.mark_message_read(message_id, current_user.sub)
        return {"detail": "Message marked as read."}

    @requires_auth
    async def delete_message(
        self,
        message_id: UUID,
        request: Request,
        for_all: bool = False,
        db: AsyncSession = Depends(AsyncSessionLocal)
    ) -> dict:
        current_user = request.state.user
        try:
            if for_all:
                await self.message_service.delete_message_for_all(message_id, current_user.sub)
                return {"detail": "Message deleted for all participants."}
            else:
                await self.message_service.delete_message_for_self(message_id, current_user.sub)
                return {"detail": "Message deleted for yourself."}
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    async def get_db(self):
        async with AsyncSessionLocal() as session:
            yield session

    @requires_auth
    async def send_message(
        self,
        message_create: MessageCreate,
        request: Request,
        db: AsyncSession = Depends(AsyncSessionLocal)
    ) -> Message:
        current_user = request.state.user
        if message_create.sender_id != current_user.sub:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot send message as another user")
        
        # Ensure that either receiver_id or group_id is provided, but not both
        if (message_create.receiver_id and message_create.group_id) or \
           (not message_create.receiver_id and not message_create.group_id):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Message must be for a single receiver or a single group.")

        return await self.message_service.send_message(
            sender_id=message_create.sender_id,
            receiver_id=message_create.receiver_id,
            group_id=message_create.group_id,
            content=message_create.content,
            is_encrypted=message_create.is_encrypted
        )

    @requires_auth
    async def get_messages_for_conversation(
        self,
        conversation_id: UUID,
        request: Request,
        db: AsyncSession = Depends(AsyncSessionLocal)
    ) -> List[Message]:
        # TODO: Add logic to ensure current_user is part of the conversation
        return await self.message_service.get_messages_for_conversation(conversation_id)

    @requires_auth
    async def get_messages_for_group(
        self,
        group_id: UUID,
        request: Request,
        db: AsyncSession = Depends(AsyncSessionLocal)
    ) -> List[Message]:
        # TODO: Add logic to ensure current_user is part of the group
        return await self.message_service.get_messages_for_group(group_id)
