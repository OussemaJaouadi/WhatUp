from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from core.database import AsyncSessionLocal
from services.conversation_service import ConversationService
from dto.conversation import ConversationResponseDto, ConversationCreate
from dto.message import Message
from models.user import User
from utils.decorators import requires_auth

class ConversationRoutes:
    def __init__(self, conversation_service: ConversationService):
        self.conversation_service = conversation_service
        self.router = APIRouter(prefix="/conversations", tags=["Conversations"])
        self.router.add_api_route("/", self.create_or_get_conversation, methods=["POST"], response_model=ConversationResponseDto)
        self.router.add_api_route("/my", self.get_my_conversations, methods=["GET"], response_model=list[ConversationResponseDto])
        self.router.add_api_route("/{conversation_id}", self.delete_conversation, methods=["DELETE"], response_model=dict)
        self.router.add_api_route("/{conversation_id}", self.get_conversation, methods=["GET"], response_model=ConversationResponseDto)

    @requires_auth
    async def create_or_get_conversation(self, request: Request, conversation_create: ConversationCreate):
        current_user = request.state.user
        if not (current_user.sub == conversation_create.user1_id or current_user.sub == conversation_create.user2_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot create conversation for other users")
        try:
            conversation = await self.conversation_service.get_or_create_conversation(
                conversation_create.user1_id,
                conversation_create.user2_id
            )
            return conversation
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    @requires_auth
    async def get_my_conversations(self, request: Request):
        current_user = request.state.user
        try:
            conversations = await self.conversation_service.get_user_conversations(current_user.sub)
            return conversations
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    @requires_auth
    async def delete_conversation(self, request: Request, conversation_id: UUID):
        current_user = request.state.user
        try:
            await self.conversation_service.delete_conversation_for_self(conversation_id, current_user.sub)
            return {"detail": "Conversation deleted for yourself."}
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    @requires_auth
    async def get_conversation(self, request: Request, conversation_id: UUID):
        try:
            conversation = await self.conversation_service.get_conversation(conversation_id)
            return conversation
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
