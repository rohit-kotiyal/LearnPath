from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import List, Optional
from app.models.session import SessionStatus


class SessionBase(BaseModel):
    mentor_id: UUID
    student_id: UUID


class SessionCreate(SessionBase):
    pass 


class SessionJoin(SessionBase):
    session_id: UUID
    passkey: str


class CodeUpdate(SessionBase):
    code_content: str


class SessionEnd(SessionBase):
    session_id: UUID


class SessionResponse(BaseModel):
    id: UUID
    passkey: str
    mentor_id: UUID
    student_id: UUID
    mentor_name: str
    student_name: str
    status: SessionStatus
    code_content: str
    start_time: datetime
    end_time: Optional[datetime]

    class config:
        from_attributes = True


class SessionListResponse(BaseModel):
    sessions: List[SessionResponse]

