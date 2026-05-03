from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SupportCreate(BaseModel):
    person_name: str
    subject: str
    message: str


class SupportResponse(BaseModel):
    id: int
    clinic_id: int
    clinic_name: Optional[str] = None
    person_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    subject: str
    message: str
    status: int = 0
    resolved_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
