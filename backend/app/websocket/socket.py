from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query, status
from fastapi.exceptions import WebSocketException
from sqlalchemy.orm import Session
from uuid import UUID
import logging

from app.websocket.manager import manager
from app.websocket.rate_limiter import rate_limiter
from app.core.database import get_db
from app.core.security import decode_access_token
from app.core.exceptions import send_ws_error
from app.core.constants import MAX_CHAT_LENGTH, MAX_CODE_SIZE, MESSAGE_HISTORY_LIMIT

from app.models.session import Session as SessionModel, SessionStatus
from app.models.message import Message
from app.routes.session import active_sessions, load_session_to_memory

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ws", tags=["Websocket"])


async def get_current_user_ws(token: str) -> str:
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)
        return user_id
    except Exception:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)


async def verify_session_participant(session_id: str, user_id: str, db: Session):
    try:
        session = db.query(SessionModel).filter(
            SessionModel.id == UUID(session_id)
        ).first()

        if not session:
            return False

        return str(session.mentor_id) == user_id or (
            session.student_id and str(session.student_id) == user_id
        )
    except Exception:
        return False


@router.websocket("/{session_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    session_id: str,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    user_id = None

    try:
        user_id = await get_current_user_ws(token)

        if not await verify_session_participant(session_id, user_id, db):
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        # Load session
        if session_id not in active_sessions:
            session = db.query(SessionModel).filter(
                SessionModel.id == UUID(session_id)
            ).first()

            if session and session.status != SessionStatus.ENDED:
                load_session_to_memory(session)
            else:
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                return

        mem_session = active_sessions.get(session_id)

        await manager.connect(session_id, websocket, user_id)

        # LOAD MESSAGE HISTORY
        messages = db.query(Message).filter(
            Message.session_id == UUID(session_id)
        ).order_by(Message.created_at.asc()).limit(MESSAGE_HISTORY_LIMIT).all()

        await websocket.send_json({
            "type": "session_state",
            "data": {
                "code_content": mem_session.get("code_content", ""),
                "participants": manager.get_session_participants(session_id),
                "messages": [
                    {
                        "id": str(m.id),
                        "content": m.content,
                        "sender_id": str(m.sender_id),
                        "created_at": m.created_at.isoformat()
                    } for m in messages
                ]
            }
        })

        while True:
            data = await websocket.receive_json()

            if not rate_limiter.is_allowed(user_id):
                await send_ws_error(websocket, "Too many requests")
                continue

            message_type = data.get("type")
            data["sender_id"] = user_id

            if message_type == "chat":
                message = data.get("data", {}).get("message", "")

                if len(message) > MAX_CHAT_LENGTH:
                    await send_ws_error(websocket, "Message too long")
                    continue

                # SAVE TO DB
                new_msg = Message(
                    session_id=UUID(session_id),
                    sender_id=UUID(user_id),
                    content=message
                )
                db.add(new_msg)
                db.commit()
                db.refresh(new_msg)

                data["data"]["id"] = str(new_msg.id)

                await manager.broadcast(session_id, data)

            elif message_type == "code_update":
                code = data.get("data", {}).get("code", "")

                if len(code) > MAX_CODE_SIZE:
                    await send_ws_error(websocket, "Code too large")
                    continue

                mem_session["code_content"] = code
                await manager.broadcast(session_id, data, exclude_websocket=websocket)

            elif message_type == "webrtc_signal":
                target = data.get("data", {}).get("target_user_id")
                if target:
                    await manager.send_to_user(session_id, target, data)

            elif message_type == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        logger.info(f"Disconnected {user_id}")

    finally:
        if user_id:
            manager.disconnect(session_id, websocket, user_id)
            await manager.broadcast(session_id, {
                "type": "user_left",
                "user_id": user_id
            })