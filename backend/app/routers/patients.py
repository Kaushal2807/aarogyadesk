from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.deps import get_current_user, get_clinic_id
from app.models.user import User
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse
from app.services.patient_service import (
    get_patient_by_uid, get_patients, get_patient_count, create_patient,
    update_patient, delete_patient
)
from app.services.patient_service import generate_patient_uid

router = APIRouter(prefix="/api/patients", tags=["patients"])


@router.get("", response_model=list[PatientResponse])
async def list_patients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: str = Query(None),
    payment_status: str = Query(None),
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    return get_patients(db, clinic_id, skip=skip, limit=limit, search=search, payment_status=payment_status)


@router.get("/count")
async def count_patients(
    payment_status: str = Query(None),
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    total = get_patient_count(db, clinic_id)
    paid = get_patient_count(db, clinic_id, "paid")
    partial = get_patient_count(db, clinic_id, "partial")
    pending = get_patient_count(db, clinic_id, "pending")
    return {"total": total, "paid": paid, "partial": partial, "pending": pending}


@router.get("/generate-uid")
async def generate_uid(
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    """Generate a new patient UID for the clinic without creating a patient."""
    return {"patient_uid": generate_patient_uid(db, clinic_id)}


@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def create_new_patient(
    patient: PatientCreate,
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    return create_patient(db, clinic_id, patient)


@router.get("/{patient_uid}", response_model=PatientResponse)
async def get_patient_detail(
    patient_uid: str,
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    patient = get_patient_by_uid(db, clinic_id, patient_uid)
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return patient


@router.put("/{patient_uid}", response_model=PatientResponse)
async def update_patient_detail(
    patient_uid: str,
    patient: PatientUpdate,
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    db_patient = update_patient(db, clinic_id, patient_uid, patient)
    if not db_patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return db_patient


@router.delete("/{patient_uid}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_patient_record(
    patient_uid: str,
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    if not delete_patient(db, clinic_id, patient_uid):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
