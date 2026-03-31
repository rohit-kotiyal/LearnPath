from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import List


class MessageCreate(BaseModel):
    session_id: UUID
    content: str = Field(..., max_length=1000)


class MessageResponse(BaseModel):
    id: UUID
    session_id: UUID
    sender_id: UUID
    sender_name: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class MessageListResponse(BaseModel):
    messages: List[MessageResponse]