from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class PrescriptionItemCreate(BaseModel):
    drug_id: Optional[int] = None
    dose_id: Optional[int] = None
    frequency_id: Optional[int] = None
    duration_id: Optional[int] = None
    quantity_id: Optional[int] = None
    instruction: Optional[str] = None


class PrescriptionCreate(BaseModel):
    patient_uid: str
    patient_name: str
    prescription_date: date
    items: List[PrescriptionItemCreate]


class PrescriptionItemResponse(BaseModel):
    id: int
    prescription_id: int
    clinic_id: int
    drug_id: Optional[int] = None
    dose_id: Optional[int] = None
    frequency_id: Optional[int] = None
    duration_id: Optional[int] = None
    quantity_id: Optional[int] = None
    instruction: Optional[str] = None
    drug_name: Optional[str] = None
    dose_name: Optional[str] = None
    frequency_name: Optional[str] = None
    duration_name: Optional[str] = None
    quantity_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class PrescriptionResponse(BaseModel):
    id: int
    clinic_id: int
    patient_uid: str
    patient_name: str
    prescription_date: date
    created_at: datetime
    items: List[PrescriptionItemResponse] = []

    class Config:
        from_attributes = True
