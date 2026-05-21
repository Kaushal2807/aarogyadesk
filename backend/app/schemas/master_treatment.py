from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MasterDiagnosisCreate(BaseModel):
    diagnosis_name: str
    description: Optional[str] = None


class MasterDiagnosisUpdate(BaseModel):
    diagnosis_name: Optional[str] = None
    description: Optional[str] = None


class MasterDiagnosisResponse(BaseModel):
    id: int
    clinic_id: int
    diagnosis_name: str
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class MasterTreatmentCreate(BaseModel):
    treatment_name: str
    description: Optional[str] = None


class MasterTreatmentUpdate(BaseModel):
    treatment_name: Optional[str] = None
    description: Optional[str] = None


class MasterTreatmentResponse(BaseModel):
    id: int
    clinic_id: int
    treatment_name: str
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
