from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MedicineCreate(BaseModel):
    name: str
    quantity: int = 0
    threshold_level: int = 10
    notes: Optional[str] = None


class MedicineUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[int] = None
    threshold_level: Optional[int] = None
    notes: Optional[str] = None


class MedicineResponse(BaseModel):
    id: int
    clinic_id: int
    name: str
    quantity: int = 0
    threshold_level: int = 10
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
