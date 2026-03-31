from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.message import Message
from app.schemas.message import MessageCreate, MessageResponse, MessageListResponse
from app.models.session import Session as SessionModel, SessionStatus
from app.models.user import User
from app.routes.session import active_sessions


router = APIRouter(prefix="/messages", tags=["Messages"])


@router.post("/", response_model=MessageResponse, status_code=201)
def send_message(
    data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session_id_str = str(data.session_id)

    if session_id_str not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not active")

    mem_session = active_sessions[session_id_str]

    if str(current_user) not in [
        mem_session["mentor_id"],
        mem_session["student_id"]
    ]:
        raise HTTPException(status_code=403, detail="Not part of session")

    if mem_session["status"] != SessionStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Session not active")

    if "messages" not in mem_session:
        mem_session["messages"] = []

    if str(current_user) == mem_session["mentor_id"]:
        sender_name = mem_session["mentor_name"]
    else:
        sender_name = mem_session.get("student_name", "Unknown")

    from uuid import uuid4
    now = datetime.now(timezone.utc)

    message_data = {
        "id": uuid4(), 
        "session_id": data.session_id,
        "sender_id": current_user,
        "sender_name": sender_name,
        "content": data.content,
        "created_at": now 
    }

    mem_session["messages"].append(message_data)

    return message_data
    


@router.get("/", response_model=MessageListResponse)
def get_messages(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session_id = str(session_id)

    if session_id in active_sessions:
        mem_session = active_sessions[session_id]

        if "messages" not in mem_session:
            return{"messages": []}
        return {"messages": mem_session["messages"]}
    
    messages = db.query(Message).filter(Message.session_id == session_id).first().order_by(
        Message.created_at.asc()).all()
    
    return {"messages": messages}


@router.delete("/{message_id}", status_code=200)
def delete_message(
    message_id: str,
    session_id: str,
    current_user: User = Depends(get_current_user)
):
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    mem_session = active_sessions[session_id]

    if str(current_user) not in [
        mem_session["mentor_id"],
        mem_session["student_id"]
    ]:
        raise HTTPException(status_code=403, detail="Not part of session")

    if "messages" not in mem_session:
        raise HTTPException(status_code=404, detail="No messages found")

    message_index = None
    for i, msg in enumerate(mem_session["messages"]):
        if str(msg["id"]) == message_id:
            message_index = i
            break

    if message_index is None:
        raise HTTPException(status_code=404, detail="Message not found")

    message = mem_session["messages"][message_index]

    if str(message["sender_id"]) != str(current_user):
        raise HTTPException(status_code=403, detail="Not allowed to delete this message")

    mem_session["messages"].pop(message_index)

    return {"message": "Message deleted successfully"}