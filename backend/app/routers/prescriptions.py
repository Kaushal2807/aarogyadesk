from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.deps import get_clinic_id
from app.schemas.prescription import PrescriptionCreate, PrescriptionResponse
from app.services.prescription_service import (
    get_prescriptions, get_prescriptions_by_patient,
    get_prescription_with_items, create_prescription, delete_prescription,
)

router = APIRouter(prefix="/api/prescriptions", tags=["prescriptions"])


@router.get("", response_model=list[PrescriptionResponse])
def list_prescriptions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    return get_prescriptions(db, clinic_id, skip=skip, limit=limit)


@router.get("/patient/{uid}", response_model=list[PrescriptionResponse])
def list_prescriptions_by_patient(
    uid: str,
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    return get_prescriptions_by_patient(db, clinic_id, uid)


@router.get("/{prescription_id}", response_model=PrescriptionResponse)
def get_prescription_detail(
    prescription_id: int,
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    prescription = get_prescription_with_items(db, prescription_id)
    if not prescription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found")
    return prescription


@router.post("", response_model=PrescriptionResponse, status_code=status.HTTP_201_CREATED)
def create_new_prescription(
    prescription: PrescriptionCreate,
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    return create_prescription(db, clinic_id, prescription)


@router.delete("/{prescription_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_prescription_record(
    prescription_id: int,
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    if not delete_prescription(db, prescription_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found")
