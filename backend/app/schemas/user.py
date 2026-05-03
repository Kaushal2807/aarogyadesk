from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime


class LoginRequest(BaseModel):
    email: str
    password: str


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    user_type: Literal["admin", "clinic"] = "clinic"
    clinic_id: Optional[int] = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    user_type: str
    clinic_id: Optional[int] = None
    status: str = "Active"
    login_status: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    user_type: Optional[Literal["admin", "clinic"]] = None
    clinic_id: Optional[int] = None
    status: Optional[Literal["Active", "Inactive"]] = None
    password: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
