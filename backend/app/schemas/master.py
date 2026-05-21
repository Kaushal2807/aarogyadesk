from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MasterResponse(BaseModel):
    id: int
    name: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MasterCreate(BaseModel):
    name: str


class MasterUpdate(BaseModel):
    name: str

    class Config:
        orm_mode = True
