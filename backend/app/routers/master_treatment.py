from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.deps import get_clinic_id
from app.schemas.master_treatment import (
    MasterDiagnosisCreate, MasterDiagnosisUpdate, MasterDiagnosisResponse,
    MasterTreatmentCreate, MasterTreatmentUpdate, MasterTreatmentResponse,
)
from app.services.master_treatment_service import (
    get_diagnoses, get_diagnosis, create_diagnosis, update_diagnosis, delete_diagnosis,
    get_treatments, get_treatment, create_treatment, update_treatment, delete_treatment,
)

router = APIRouter(prefix="/api", tags=["master-treatment"])


# ── Diagnoses ──

@router.get("/master-diagnosis", response_model=list[MasterDiagnosisResponse])
async def list_diagnoses(
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
    skip: int = 0,
    limit: int = 100,
):
    return get_diagnoses(db, clinic_id, skip, limit)


@router.post("/master-diagnosis", response_model=MasterDiagnosisResponse, status_code=status.HTTP_201_CREATED)
async def add_diagnosis(
    data: MasterDiagnosisCreate,
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    return create_diagnosis(db, clinic_id, data)


@router.put("/master-diagnosis/{diagnosis_id}", response_model=MasterDiagnosisResponse)
async def edit_diagnosis(
    diagnosis_id: int,
    data: MasterDiagnosisUpdate,
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    result = update_diagnosis(db, clinic_id, diagnosis_id, data)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Diagnosis not found")
    return result


@router.delete("/master-diagnosis/{diagnosis_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_diagnosis(
    diagnosis_id: int,
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    if not delete_diagnosis(db, clinic_id, diagnosis_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Diagnosis not found")


# ── Treatments ──

@router.get("/master-treatment", response_model=list[MasterTreatmentResponse])
async def list_treatments(
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
    skip: int = 0,
    limit: int = 100,
):
    return get_treatments(db, clinic_id, skip, limit)


@router.post("/master-treatment", response_model=MasterTreatmentResponse, status_code=status.HTTP_201_CREATED)
async def add_treatment(
    data: MasterTreatmentCreate,
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    return create_treatment(db, clinic_id, data)


@router.put("/master-treatment/{treatment_id}", response_model=MasterTreatmentResponse)
async def edit_treatment(
    treatment_id: int,
    data: MasterTreatmentUpdate,
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    result = update_treatment(db, clinic_id, treatment_id, data)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Treatment not found")
    return result


@router.delete("/master-treatment/{treatment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_treatment(
    treatment_id: int,
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    if not delete_treatment(db, clinic_id, treatment_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Treatment not found")
