from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from uuid import UUID
from datetime import datetime, timezone
from typing import List, Dict
from app.core.database import get_db
from app.core.security import get_current_user, generate_passkey
from app.models.user import User
from app.models.session import Session as SessionModel, SessionStatus
from app.schemas.session import (
    SessionCreate,
    SessionResponse,
    SessionListResponse,
    SessionJoin,
    SessionEnd,
    CodeUpdate
)
from app.models.message import Message

router = APIRouter(prefix="/sessions", tags=["Sessions"])

# In-memory storage for active sessions (use Redis in production)
active_sessions: Dict[str, dict] = {}


def load_session_to_memory(session: SessionModel) -> dict:
    session_data = {
        "mentor_id": str(session.mentor_id),
        "mentor_name": session.mentor_name,
        "passkey": session.passkey,
        "status": session.status,
        "code_content": session.code_content or "",
        "student_id": str(session.student_id) if session.student_id else None,
        "student_name": session.student_name,
        "start_time": session.start_time,
    }
    
    active_sessions[str(session.id)] = session_data
    return session_data


@router.post("/create", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(
    data: SessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # SECURITY: Ensure mentor_id matches current user
    if str(data.mentor_id) != str(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create sessions as yourself"
        )
    
    passkey = generate_passkey()
    retry_count = 0
    max_retries = 10
    
    # Check for passkey uniqueness
    while db.query(SessionModel).filter(SessionModel.passkey == passkey).first():
        retry_count += 1
        if retry_count >= max_retries:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unable to generate unique passkey. Please try again."
            )
        passkey = generate_passkey()
    
    # Create session with ONLY mentor_id, mentor_name, passkey - minimal DB write
    session = SessionModel(
        mentor_id=data.mentor_id,
        mentor_name=data.mentor_name,
        passkey=passkey,
        status=SessionStatus.WAITING,
        # student_id, student_name, start_time, end_time remain NULL
    )
    
    try:
        db.add(session)
        db.commit()
        db.refresh(session)
        
        # Store in-memory for quick access during session
        load_session_to_memory(session)
        
        return session
    
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred while creating session"
        )
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


@router.get("/", response_model=SessionListResponse)
def get_all_session(
    skip: int = 0,
    limit: int = 100,
    status_filter: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # SECURITY: Validate pagination
    if limit > 1000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Limit cannot exceed 1000"
        )
    
    if skip < 0 or limit < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid pagination parameters"
        )
    
    try:
        # Convert current_user (string UUID) to UUID for comparison
        user_uuid = UUID(current_user) if isinstance(current_user, str) else current_user
        
        query = db.query(SessionModel).filter(
            (SessionModel.mentor_id == user_uuid) |
            (SessionModel.student_id == user_uuid)
        )

        if status_filter:
            if status_filter not in ["waiting", "active", "ended"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid status filter. Must be: waiting, active, or ended"
                )
            query = query.filter(SessionModel.status == status_filter)
        
        sessions = query.order_by(SessionModel.created_at.desc()).offset(skip).limit(limit).all()
        
        # Merge with in-memory data for active sessions
        enriched_sessions = []
        for session in sessions:
            session_id = str(session.id)
            
            # If session is not ended but not in memory, load it
            if session.status != SessionStatus.ENDED and session_id not in active_sessions:
                load_session_to_memory(session)
            
            if session_id in active_sessions and session.status != SessionStatus.ENDED:
                # Use in-memory data for active/waiting sessions
                mem_data = active_sessions[session_id]
                session.student_id = UUID(mem_data.get("student_id")) if mem_data.get("student_id") else None
                session.student_name = mem_data.get("student_name")
                session.code_content = mem_data.get("code_content", "")
                session.status = mem_data.get("status", session.status)
            enriched_sessions.append(session)
        
        return {"sessions": enriched_sessions}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


@router.post("/join", status_code=status.HTTP_200_OK)
def join_session(
    data: SessionJoin,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Verify session exists in DB
        session = db.query(SessionModel).filter(
            SessionModel.id == data.session_id,
            SessionModel.passkey == data.passkey
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found or invalid passkey"
            )
        
        # Check if session has already ended in DB
        if session.status == SessionStatus.ENDED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Session has already ended"
            )
        
        session_id = str(session.id)
        
        # AUTO-RECOVERY: If not in memory but exists in DB, load it
        if session_id not in active_sessions:
            load_session_to_memory(session)
        
        mem_session = active_sessions[session_id]
        
        if mem_session["status"] == SessionStatus.ENDED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Session has already ended"
            )
        
        if mem_session["student_id"] is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Session is already full"
            )
        
        if mem_session["mentor_id"] == str(current_user):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot join your own session as a student"
            )
        
        # Update in-memory ONLY - no DB write
        mem_session["student_id"] = str(current_user)
        mem_session["student_name"] = data.student_name
        mem_session["status"] = SessionStatus.ACTIVE
        mem_session["start_time"] = datetime.now(timezone.utc)
        
        return {
            "message": "Joined session successfully",
            "session": {
                "id": session_id,
                "mentor_id": mem_session["mentor_id"],
                "student_id": str(current_user),
                "status": SessionStatus.ACTIVE.value,
                "start_time": mem_session["start_time"].isoformat()
            }
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )


@router.put("/code", status_code=status.HTTP_200_OK)
def update_code(
    session_id: UUID,
    data: CodeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        session_id_str = str(session_id)
        
        # AUTO-RECOVERY: If not in memory, try to load from DB
        if session_id_str not in active_sessions:
            session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
            if session and session.status != SessionStatus.ENDED:
                load_session_to_memory(session)
            else:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Session not found or not active"
                )
        
        mem_session = active_sessions[session_id_str]
        
        # Authorization check
        if mem_session["mentor_id"] != str(current_user) and mem_session["student_id"] != str(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a participant in this session"
            )
        
        if mem_session["status"] != SessionStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Session is not active. Cannot update code."
            )
        
        if len(data.code_content) > 1_000_000:  # 1MB limit
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Code content exceeds maximum size (1MB)"
            )
        
        # Update in-memory ONLY
        mem_session["code_content"] = data.code_content
        
        return {
            "message": "Code updated successfully",
            "session_id": session_id_str
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


@router.post("/end", status_code=status.HTTP_200_OK)
def end_session(
    data: SessionEnd,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        session_id_str = str(data.session_id)
        
        # Get session from DB
        session = db.query(SessionModel).filter(SessionModel.id == data.session_id).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        if str(session.mentor_id) != str(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the mentor can end the session"
            )
        
        # AUTO-RECOVERY: If not in memory, load from DB
        if session_id_str not in active_sessions:
            load_session_to_memory(session)
        
        mem_session = active_sessions[session_id_str]
        
        if mem_session["status"] == SessionStatus.ENDED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Session has already ended"
            )
        
        # SAVE MESSAGES TO DB
        if "messages" in mem_session and mem_session["messages"]:
            db_messages = [
                Message(
                    session_id=data.session_id,
                    sender_id=msg["sender_id"],
                    sender_name=msg["sender_name"],
                    content=msg["content"],
                    created_at=msg["created_at"]
                )
                for msg in mem_session["messages"]
            ]

            db.add_all(db_messages)

        # SAVE SESSION DATA
        end_time = datetime.now(timezone.utc)
        
        session.student_id = (UUID(mem_session["student_id"]) if mem_session.get("student_id") else None)
        session.student_name = mem_session["student_name"]
        session.start_time = mem_session["start_time"]
        session.end_time = end_time
        session.code_content = mem_session["code_content"]
        session.status = SessionStatus.ENDED
        
        # SINGLE COMMIT (session + messages together)
        db.commit()
        
        # Clean up in-memory data
        del active_sessions[session_id_str]
        
        return {
            "message": "Session ended successfully",
            "session_id": session_id_str,
            "started_at": mem_session["start_time"].isoformat() if mem_session["start_time"] else None,
            "ended_at": end_time.isoformat()
        }
    
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred"
        )
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )