from sqlalchemy import Column, String, Integer, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid
from datetime import datetime, timezone
import enum


class UserRole(str, enum.Enum):
    MENTOR = "mentor"
    STUDENT = "student"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(100), nullable=False, unique=True, index=True)
    full_name = Column(String(100), nullable=False)
    password = Column(String(100), nullable=False)
    
    role = Column(
        Enum(UserRole, name='user_role'),
        nullable=False,
        default=UserRole.STUDENT
    )
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    
