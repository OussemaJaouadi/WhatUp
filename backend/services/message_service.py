from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.message import Message
from models.user import User
from models.group_member import GroupMember # Import GroupMember
from dto.message import MessageCreate, Message as MessageDto
from services.conversation_service import ConversationService
from services.user_service import UserService
from utils.encryption import EncryptionUtil

class MessageService:
    def __init__(self, db_session_factory: AsyncSession, conversation_service: ConversationService, user_service: UserService, encryption_util: EncryptionUtil):
        self.db_session_factory = db_session_factory
        self.conversation_service = conversation_service
        self.user_service = user_service
        self.encryption_util = encryption_util

    async def delete_message_for_self(self, message_id: UUID, user_id: UUID):
        async with self.db_session_factory() as session:
            result = await session.execute(select(Message).filter(Message.id == message_id))
            message = result.scalar_one_or_none()
            if not message:
                raise ValueError("Message not found")
            # Mark as deleted for this user (soft delete)
            # You may want to implement a MessageDeleteMeta table for per-user delete, but for MVP, just hide in frontend
            # Here, we do nothing in DB, but frontend should filter out messages marked as deleted for this user
            pass

    async def delete_message_for_all(self, message_id: UUID, user_id: UUID):
        async with self.db_session_factory() as session:
            result = await session.execute(select(Message).filter(Message.id == message_id))
            message = result.scalar_one_or_none()
            if not message:
                raise ValueError("Message not found")
            # Only sender can unsend for all
            if message.sender_id != user_id:
                raise ValueError("Only sender can delete message for all participants.")
            message.is_deleted_for_all = True
            await session.commit()

    async def send_message(
        self,
        sender_id: UUID,
        receiver_id: UUID = None,
        group_id: UUID = None,
        content: str = None,
        is_encrypted: bool = False
    ) -> MessageDto:
        async with self.db_session_factory() as session:
            if receiver_id and group_id:
                raise ValueError("Message cannot have both receiver and group defined.")
            if not receiver_id and not group_id:
                raise ValueError("Message must have either a receiver or a group defined.")

            if receiver_id:
                # Handle private message
                conversation = await self.conversation_service.get_or_create_conversation(sender_id, receiver_id)
                if is_encrypted:
                    # For E2E, the client would encrypt. Here, for demonstration, service encrypts.
                    # In a real E2E system, the backend would not have access to private keys for decryption.
                    receiver_user = await self.user_service.get_user_by_id(str(receiver_id))
                    if not receiver_user or not receiver_user.public_key:
                        raise ValueError("Receiver public key not found for encryption.")
                    # The content is already encrypted by the client, so we just store it.
                    content_to_store = content
                else:
                    content_to_store = content

                new_message = Message(
                    sender_id=sender_id,
                    receiver_id=receiver_id,
                    conversation_id=conversation.id,
                    content=content_to_store,
                    is_encrypted=is_encrypted
                )
            elif group_id:
                # Handle group message
                # Group messages are not encrypted end-to-end in this example
                new_message = Message(
                    sender_id=sender_id,
                    group_id=group_id,
                    content=content,
                    is_encrypted=False # Group messages are not E2E encrypted
                )
            
            session.add(new_message)
            await session.commit()
            await session.refresh(new_message)
            return MessageDto.model_validate(new_message)

    async def mark_message_read(self, message_id: UUID, user_id: UUID):
        async with self.db_session_factory() as session:
            # Fetch the message
            result = await session.execute(select(Message).filter(Message.id == message_id))
            message = result.scalar_one_or_none()
            if not message:
                raise ValueError("Message not found")

            # For direct messages, update is_read if receiver matches
            if message.receiver_id == user_id:
                message.is_read = True
                await session.commit()

            # Create a MessageReadReceipt for this user/message
            from models.message_meta import MessageReadReceipt
            receipt_result = await session.execute(
                select(MessageReadReceipt).filter(
                    MessageReadReceipt.message_id == message_id,
                    MessageReadReceipt.user_id == user_id
                )
            )
            receipt = receipt_result.scalar_one_or_none()
            if not receipt:
                new_receipt = MessageReadReceipt(message_id=message_id, user_id=user_id)
                session.add(new_receipt)
                await session.commit()

    async def get_messages_for_conversation(self, conversation_id: UUID) -> list[Message]:
        async with self.db_session_factory() as session:
            result = await session.execute(
                select(Message).filter(Message.conversation_id == conversation_id).order_by(Message.created_at)
            )
            messages = result.scalars().all()
            return [MessageDto.model_validate(msg) for msg in messages]

    async def get_messages_for_group(self, group_id: UUID) -> list[Message]:
        async with self.db_session_factory() as session:
            result = await session.execute(
                select(Message).filter(Message.group_id == group_id).order_by(Message.created_at)
            )
            messages = result.scalars().all()
            return [MessageDto.model_validate(msg) for msg in messages]

    async def get_group_members(self, group_id: UUID) -> list[User]:
        async with self.db_session_factory() as session:
            result = await session.execute(
                select(User).join(GroupMember).filter(GroupMember.group_id == group_id)
            )
            return result.scalars().all()
