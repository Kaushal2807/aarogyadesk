from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class WorkDoneCreate(BaseModel):
    work_name: str


class WorkDoneUpdate(BaseModel):
    work_name: str


class WorkDoneResponse(BaseModel):
    id: int
    clinic_id: int
    work_name: str
    created_at: datetime

    class Config:
        from_attributes = True


class PatientWorkDoneCreate(BaseModel):
    patient_uid: str
    patient_name: str
    work_done_id: Optional[int] = None
    description: Optional[str] = None
    work_date: Optional[date] = None


class PatientWorkDoneUpdate(BaseModel):
    patient_uid: Optional[str] = None
    patient_name: Optional[str] = None
    work_done_id: Optional[int] = None
    description: Optional[str] = None
    work_date: Optional[date] = None


class PatientWorkDoneResponse(BaseModel):
    id: int
    clinic_id: int
    patient_uid: str
    patient_name: str
    work_done_id: Optional[int] = None
    work_name: Optional[str] = None
    description: Optional[str] = None
    work_date: Optional[date] = None
    created_at: datetime

    class Config:
        from_attributes = True
