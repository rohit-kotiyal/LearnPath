from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import List, Optional
from app.models.session import SessionStatus


class SessionCreate(BaseModel):
    mentor_id: UUID
    mentor_name: str = Field(..., min_length=1, max_length=255)


class SessionJoin(BaseModel):
    session_id: UUID
    passkey: str = Field(..., max_length=10)
    student_name: str = Field(..., min_length=1, max_length=255)


class CodeUpdate(BaseModel):
    code_content: str = Field(..., max_length=1_000_000)


class SessionEnd(BaseModel):
    session_id: UUID


class SessionResponse(BaseModel):
    id: UUID
    passkey: str
    mentor_id: UUID
    mentor_name: str
    student_id: Optional[UUID] = None
    student_name: Optional[str] = None
    status: SessionStatus
    code_content: Optional[str] = ""
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

    class Config:
        from_attributes = True


class SessionListResponse(BaseModel):
    sessions: List[SessionResponse]