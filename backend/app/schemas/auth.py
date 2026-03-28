from pydantic import BaseModel, EmailStr, Field
from app.models.user import UserRole


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=5, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    role: UserRole
