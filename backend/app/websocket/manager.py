from typing import Dict, List, Optional, Tuple
from fastapi import WebSocket
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        # session_id -> list of (websocket, user_id)
        self.active_connections: Dict[str, List[Tuple[WebSocket, str]]] = {}

    async def connect(self, session_id: str, websocket: WebSocket, user_id: str):
        await websocket.accept()

        if session_id not in self.active_connections:
            self.active_connections[session_id] = []

        self.active_connections[session_id].append((websocket, user_id))

        logger.info(f"User {user_id} connected to session {session_id}")

        await self.broadcast(
            session_id,
            {
                "type": "user_joined",
                "user_id": user_id,
                "timestamp": datetime.now(timezone.utc).isoformat()
            },
            exclude_websocket=websocket
        )

    def disconnect(self, session_id: str, websocket: WebSocket, user_id: str):
        if session_id in self.active_connections:
            self.active_connections[session_id] = [
                (ws, uid) for ws, uid in self.active_connections[session_id]
                if ws != websocket
            ]

            if not self.active_connections[session_id]:
                del self.active_connections[session_id]

            logger.info(f"User {user_id} disconnected from session {session_id}")

    async def broadcast(
        self,
        session_id: str,
        message: dict,
        exclude_websocket: Optional[WebSocket] = None
    ):
        if session_id not in self.active_connections:
            return

        if "timestamp" not in message:
            message["timestamp"] = datetime.now(timezone.utc).isoformat()

        disconnected = []

        for websocket, user_id in self.active_connections[session_id]:
            if websocket == exclude_websocket:
                continue

            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.error(f"Send failed to {user_id}: {e}")
                disconnected.append((websocket, user_id))

        for ws, uid in disconnected:
            self.disconnect(session_id, ws, uid)

    async def send_to_user(self, session_id: str, target_user_id: str, message: dict):
        if session_id not in self.active_connections:
            return False

        for websocket, user_id in self.active_connections[session_id]:
            if user_id == target_user_id:
                try:
                    await websocket.send_json(message)
                    return True
                except Exception:
                    self.disconnect(session_id, websocket, user_id)
                    return False

        return False

    def get_session_participants(self, session_id: str):
        if session_id not in self.active_connections:
            return []

        return [uid for _, uid in self.active_connections[session_id]]


manager = ConnectionManager()