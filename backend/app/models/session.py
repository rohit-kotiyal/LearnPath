from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum, uuid
from datetime import datetime, timezone


class SessionStatus(str, enum.Enum):
    WAITING = "waiting"
    ACTIVE = "active"
    ENDED = "ended"


class Session(Base):
    __tablename__ = "sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    passkey = Column(String(10), unique=True, index=True, nullable=False)

    mentor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)

    mentor = relationship("User", foreign_keys=[mentor_id], backref="mentor_sessions")
    student = relationship("User", foreign_keys=[student_id], backref="student_sessions")

    status = Column(
        Enum(SessionStatus, name="session_status"),
        nullable=False,
        default=SessionStatus.WAITING
    )

    code_content = Column(Text, default="", nullable=False)

    start_time = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    end_time = Column(
        DateTime(timezone=True),
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )

    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )