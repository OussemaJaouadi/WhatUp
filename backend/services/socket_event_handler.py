from uuid import UUID
from models.message import Message as MessageModel
from models.conversation import Conversation
from models.message_meta import MessageReadReceipt
from fastapi import HTTPException, status

class SocketEventHandler:
    def __init__(self, message_service, manager, db_session):
        self.message_service = message_service
        self.manager = manager
        self.db_session = db_session

    async def handle(self, event_type, data, user_payload):
        if event_type == "read":
            await self.handle_read(data, user_payload)
        elif event_type == "typing":
            await self.handle_typing(data, user_payload)
        elif event_type == "send":
            await self.handle_send(data, user_payload)
        # Add more event types as needed

    async def handle_read(self, data, user_payload):
        message_id = UUID(data["message_id"])
        await self.message_service.mark_message_read(message_id, user_payload.sub)
        # Optionally, notify the sender that their message was read
        result = await self.db_session.execute(
            MessageModel.__table__.select().where(MessageModel.id == message_id)
        )
        msg_row = result.first()
        if msg_row and msg_row.sender_id != user_payload.sub:
            await self.manager.send_personal_message({
                "type": "read_receipt",
                "message_id": str(message_id),
                "reader_id": str(user_payload.sub)
            }, msg_row.sender_id)

    async def handle_typing(self, data, user_payload):
        conversation_id = UUID(data["conversation_id"])
        result = await self.db_session.execute(
            Conversation.__table__.select().where(Conversation.id == conversation_id)
        )
        conv_row = result.first()
        if conv_row:
            for participant_id in [conv_row.user1_id, conv_row.user2_id]:
                if participant_id != user_payload.sub:
                    await self.manager.send_personal_message({
                        "type": "typing",
                        "conversation_id": str(conversation_id),
                        "user_id": str(user_payload.sub)
                    }, participant_id)

    async def handle_send(self, data, user_payload):
        from dto.message import MessageCreate
        message_create = MessageCreate(**data)
        if message_create.sender_id != user_payload.sub:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot send message as another user")
        sent_message = await self.message_service.send_message(
            sender_id=message_create.sender_id,
            receiver_id=message_create.receiver_id,
            group_id=message_create.group_id,
            content=message_create.content,
            is_encrypted=message_create.is_encrypted
        )
        if sent_message.receiver_id:
            await self.manager.send_personal_message(sent_message, sent_message.receiver_id)
        elif sent_message.group_id:
            group_members = await self.message_service.get_group_members(sent_message.group_id)
            group_member_ids = [member.id for member in group_members]
            await self.manager.send_group_message(sent_message, group_member_ids)
