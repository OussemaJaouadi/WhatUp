from typing import Dict, List
from uuid import UUID
from fastapi import WebSocket
from dto.message import Message

class WebSocketConnectionManager:
    def __init__(self):
        self.active_connections: Dict[UUID, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: UUID):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: UUID):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: Message, user_id: UUID):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_json(message.model_dump_json())

    async def send_group_message(self, message: Message, group_member_ids: List[UUID]):
        for member_id in group_member_ids:
            if member_id in self.active_connections:
                await self.active_connections[member_id].send_json(message.model_dump_json())
