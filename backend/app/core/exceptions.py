from fastapi import WebSocket
import logging

logger = logging.getLogger(__name__)


async def send_ws_error(websocket: WebSocket, message: str):
    try:
        await websocket.send_json({
            "type": "error",
            "message": message
        })
    except Exception as e:
        logger.error(f"WS error send failed: {e}")