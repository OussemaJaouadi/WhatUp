from uuid import UUID
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from models.conversation import Conversation
from models.user import User
from dto.conversation import ConversationCreate, ConversationResponseDto

class ConversationService:
    def __init__(self, db_session_factory):
        self.db_session_factory = db_session_factory

    async def get_conversation(self, conversation_id: UUID) -> ConversationResponseDto:
        async with self.db_session_factory() as session:
            result = await session.execute(select(Conversation).where(Conversation.id == conversation_id))
            conversation = result.scalar_one_or_none()
            if not conversation:
                raise ValueError("Conversation not found")
            return ConversationResponseDto.model_validate(conversation)

    async def get_or_create_conversation(self, user1_id: UUID, user2_id: UUID) -> ConversationResponseDto:
        async with self.db_session_factory() as session:
            result = await session.execute(
                select(Conversation).where(
                    ((Conversation.user1_id == user1_id) & (Conversation.user2_id == user2_id)) |
                    ((Conversation.user1_id == user2_id) & (Conversation.user2_id == user1_id))
                )
            )
            conversation = result.scalar_one_or_none()
            if conversation:
                return ConversationResponseDto.model_validate(conversation)
            new_conversation = Conversation(user1_id=user1_id, user2_id=user2_id)
            session.add(new_conversation)
            try:
                await session.commit()
                await session.refresh(new_conversation)
            except IntegrityError:
                await session.rollback()
                raise ValueError("Failed to create conversation")
            return ConversationResponseDto.model_validate(new_conversation)

    async def get_user_conversations(self, user_id: UUID) -> list[ConversationResponseDto]:
        async with self.db_session_factory() as session:
            result = await session.execute(
                select(Conversation).where(
                    (Conversation.user1_id == user_id) | (Conversation.user2_id == user_id)
                )
            )
            conversations = result.scalars().all()
            return [ConversationResponseDto.model_validate(conv) for conv in conversations]

    async def delete_conversation_for_self(self, conversation_id: UUID, user_id: UUID) -> None:
        async with self.db_session_factory() as session:
            result = await session.execute(select(Conversation).where(Conversation.id == conversation_id))
            conversation = result.scalar_one_or_none()
            if not conversation:
                raise ValueError("Conversation not found")
            # For MVP, do nothing in DB, frontend should hide this conversation for the user
            return
