from pydantic import BaseModel
from typing import Optional, Literal, List
from datetime import date, datetime


class AppointmentCreate(BaseModel):
    patient_name: str
    age: Optional[int] = None
    contact_number: Optional[str] = None
    address: Optional[str] = None
    appointment_date: date
    appointment_time: str  # "HH:MM" format
    booking_type: Literal["call", "walk-in"] = "walk-in"


class AppointmentUpdate(BaseModel):
    patient_name: Optional[str] = None
    age: Optional[int] = None
    contact_number: Optional[str] = None
    address: Optional[str] = None
    appointment_date: Optional[date] = None
    appointment_time: Optional[str] = None
    booking_type: Optional[Literal["call", "walk-in"]] = None


class AppointmentResponse(BaseModel):
    id: int
    clinic_id: int
    patient_name: str
    age: Optional[int] = None
    contact_number: Optional[str] = None
    address: Optional[str] = None
    appointment_date: date
    appointment_time: str
    booking_type: str = "walk-in"
    status: str = "pending"
    created_at: datetime

    class Config:
        from_attributes = True


class AppointmentFilter(BaseModel):
    date: date
    status: Optional[str] = None
    search: Optional[str] = None
    skip: int = 0
    limit: int = 20


class AppointmentPaginatedResponse(BaseModel):
    items: List[AppointmentResponse]
    total: int
    skip: int
    limit: int
