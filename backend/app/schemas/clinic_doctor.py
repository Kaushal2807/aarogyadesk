from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ClinicDoctorCreate(BaseModel):
    doctor_name: str
    doctor_position: Optional[str] = None


class ClinicDoctorUpdate(BaseModel):
    doctor_name: Optional[str] = None
    doctor_position: Optional[str] = None


class ClinicDoctorResponse(BaseModel):
    id: int
    clinic_id: int
    doctor_name: str
    doctor_position: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
