from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from typing import Dict, List
from uuid import UUID
from utils.jwt import verify_token, get_current_user_ws
from dto.token import TokenPayload
from dto.message import MessageCreate, Message
from core.config import settings

from services.websocket_manager import WebSocketConnectionManager


class WebSocketRoutes:
    def __init__(self, manager, socket_event_handler):
        self.manager = manager
        self.socket_event_handler = socket_event_handler
        self.router = APIRouter()
        self.router.add_api_websocket_route("/ws", self.websocket_endpoint)

    async def websocket_endpoint(
        self,
        websocket: WebSocket,
        user_payload: TokenPayload = Depends(get_current_user_ws)
    ):
        await self.manager.connect(websocket, user_payload.sub)
        try:
            while True:
                data = await websocket.receive_json()
                event_type = data.get("type", "send")
                db_session = await self.socket_event_handler.message_service.db_session_factory().__aenter__()
                await self.socket_event_handler.handle(event_type, data, user_payload, db_session)
                await db_session.__aexit__(None, None, None)

        except WebSocketDisconnect:
            self.manager.disconnect(user_payload.sub)
            # Optionally, broadcast user left message
        except Exception as e:
            print(f"WebSocket error: {e}")
            self.manager.disconnect(user_payload.sub)
            await websocket.close(code=status.WS_1011_INTERNAL_ERROR)

