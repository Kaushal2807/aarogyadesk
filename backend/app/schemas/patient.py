from pydantic import BaseModel
from typing import Optional, Literal
from datetime import date, datetime
from decimal import Decimal


class PatientCreate(BaseModel):
    name: str
    age: Optional[int] = None
    contact_number: Optional[str] = None
    address: Optional[str] = None
    date_of_visit: Optional[date] = None
    notes: Optional[str] = None
    total_amount: float = 0
    payment_status: Literal["paid", "partial", "pending"] = "pending"
    payment_pending: float = 0
    chief_complain: Optional[str] = None
    medical_history: Optional[str] = None
    oral_diet_habit: Optional[str] = None
    family_history: Optional[str] = None
    xray_remark: Optional[str] = None


class PatientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    contact_number: Optional[str] = None
    address: Optional[str] = None
    date_of_visit: Optional[date] = None
    total_visit: Optional[int] = None
    notes: Optional[str] = None
    total_amount: Optional[float] = None
    payment_status: Optional[Literal["paid", "partial", "pending"]] = None
    payment_pending: Optional[float] = None
    chief_complain: Optional[str] = None
    medical_history: Optional[str] = None
    oral_diet_habit: Optional[str] = None
    family_history: Optional[str] = None
    xray_remark: Optional[str] = None


class PatientResponse(BaseModel):
    id: int
    clinic_id: int
    patient_uid: str
    name: str
    age: Optional[int] = None
    contact_number: Optional[str] = None
    address: Optional[str] = None
    date_of_visit: Optional[date] = None
    total_visit: int = 1
    notes: Optional[str] = None
    total_amount: float = 0
    payment_status: str = "pending"
    payment_pending: float = 0
    chief_complain: Optional[str] = None
    medical_history: Optional[str] = None
    oral_diet_habit: Optional[str] = None
    family_history: Optional[str] = None
    xray_remark: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
