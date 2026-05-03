from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TreatmentPlanCreate(BaseModel):
    diagnosis: str
    treatment: str


class TreatmentPlanUpdate(BaseModel):
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None


class TreatmentPlanResponse(BaseModel):
    id: int
    clinic_id: int
    diagnosis: str
    treatment: str
    created_at: datetime

    class Config:
        from_attributes = True


class PatientTreatmentCreate(BaseModel):
    patient_uid: str
    patient_name: str
    tooth_upper_right: Optional[str] = None
    tooth_upper_left: Optional[str] = None
    tooth_lower_right: Optional[str] = None
    tooth_lower_left: Optional[str] = None
    diagnosis_id: Optional[int] = None
    treatment_id: Optional[int] = None
    estimates: Optional[str] = None
    remarks: Optional[str] = None


class PatientTreatmentUpdate(BaseModel):
    patient_uid: Optional[str] = None
    patient_name: Optional[str] = None
    tooth_upper_right: Optional[str] = None
    tooth_upper_left: Optional[str] = None
    tooth_lower_right: Optional[str] = None
    tooth_lower_left: Optional[str] = None
    diagnosis_id: Optional[int] = None
    treatment_id: Optional[int] = None
    estimates: Optional[str] = None
    remarks: Optional[str] = None


class PatientTreatmentResponse(BaseModel):
    id: int
    clinic_id: int
    patient_uid: str
    patient_name: str
    tooth_upper_right: Optional[str] = None
    tooth_upper_left: Optional[str] = None
    tooth_lower_right: Optional[str] = None
    tooth_lower_left: Optional[str] = None
    diagnosis_id: Optional[int] = None
    treatment_id: Optional[int] = None
    estimates: Optional[str] = None
    remarks: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
