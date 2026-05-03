from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TemplateCreate(BaseModel):
    template_name: str
    template_content: str


class TemplateUpdate(BaseModel):
    template_name: Optional[str] = None
    template_content: Optional[str] = None


class TemplateResponse(BaseModel):
    id: int
    clinic_id: int
    template_name: str
    template_content: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
