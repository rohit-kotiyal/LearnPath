from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from uuid import UUID
from datetime import datetime, timezone
from typing import List
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


router = APIRouter(prefix="/sessions", tags=["Sessions"])


@router.post("/create", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(
    data: SessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # SECURITY: Ensure mentor_id matches current user
    if data.mentor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create sessions as yourself"
        )
    
    # SECURITY: Validate student_id if provided
    if data.student_id is not None:
        student = db.query(User).filter(User.id == data.student_id).first()
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student user not found"
            )
        
        if data.student_id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot create a session with yourself"
            )
    
    passkey = generate_passkey()
    retry_count = 0
    max_retries = 10  # SECURITY: Prevent infinite loop
    
    while db.query(SessionModel).filter(SessionModel.passkey == passkey).first():
        retry_count += 1
        if retry_count >= max_retries:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unable to generate unique passkey. Please try again."
            )
        passkey = generate_passkey()
    

    session = SessionModel(
        mentor_id=data.mentor_id,
        student_id=data.student_id,
        passkey=passkey,
        status=SessionStatus.WAITING
    )
    
    try:
        db.add(session)
        db.commit()
        db.refresh(session)
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
    status_filter: str = None,  # "waiting", "active", "ended"
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
        query = db.query(SessionModel).filter(
            (SessionModel.mentor_id == current_user.id) |
            (SessionModel.student_id == current_user.id)
        )

        if status_filter:
            if status_filter not in ["waiting", "active", "ended"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid status filter. Must be: waiting, active, or ended"
                )
            query = query.filter(SessionModel.status == status_filter)
        
        sessions = query.order_by(SessionModel.start_time.desc()).offset(skip).limit(limit).all()
        
        return sessions
    
    except HTTPException:
        raise
    
    except Exception:
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
        # Find session with matching ID and passkey
        session = db.query(SessionModel).filter(
            SessionModel.id == data.session_id,
            SessionModel.passkey == data.passkey
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found or invalid passkey"
            )
        
        if session.status == SessionStatus.ENDED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Session has already ended"
            )
        
        if session.student_id is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Session is already full"
            )
        
        if session.mentor_id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot join your own session as a student"
            )
        
        session.student_id = current_user.id
        session.status = SessionStatus.ACTIVE
        db.commit()
        db.refresh(session)
        
        return {
            "message": "Joined session successfully",
            "session": session.to_dict()
        }
    
    except HTTPException:
        raise
    
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred"
        )
    
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


@router.put("/code", status_code=status.HTTP_200_OK)
def update_code(
    session_id: UUID,
    data: CodeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    try:
        session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )

        if session.mentor_id != current_user.id and session.student_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a participant in this session"
            )
        
        if session.status != SessionStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Session is not active. Cannot update code."
            )
        
        if len(data.code_content) > 1_000_000:  # 1MB limit
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Code content exceeds maximum size (1MB)"
            )
        
        session.code_content = data.code_content
        db.commit()
        
        return {
            "message": "Code updated successfully",
            "session_id": str(session.id)
        }
    
    except HTTPException:
        raise
    
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred"
        )
    
    except Exception:
        db.rollback()
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
        session = db.query(SessionModel).filter(SessionModel.id == data.session_id).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        if session.mentor_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the mentor can end the session"
            )
        
        if session.status == SessionStatus.ENDED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Session has already ended"
            )
        
        session.status = SessionStatus.ENDED
        session.end_time = datetime.now(timezone.utc)
        db.commit()
        
        return {
            "message": "Session ended successfully",
            "session_id": str(session.id),
            "ended_at": session.end_time.isoformat()
        }
    
    except HTTPException:
        raise
    
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred"
        )
    
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )

