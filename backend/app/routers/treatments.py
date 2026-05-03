from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.deps import get_clinic_id
from app.schemas.treatment import (
    TreatmentPlanCreate, TreatmentPlanUpdate, TreatmentPlanResponse,
    PatientTreatmentCreate, PatientTreatmentUpdate, PatientTreatmentResponse,
)
from app.services.treatment_service import (
    get_plans, create_plan, update_plan,
    get_treatments, get_treatments_by_patient, get_treatment_by_id,
    create_treatment, update_treatment, delete_treatment,
)

router = APIRouter(tags=["treatments"])


# ---------------------------------------------------------------------------
# Treatment Plans
# ---------------------------------------------------------------------------

@router.get("/api/treatment-plans", response_model=list[TreatmentPlanResponse])
async def list_treatment_plans(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: str = Query(None),
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    return get_plans(db, clinic_id, skip=skip, limit=limit, search=search)


@router.post("/api/treatment-plans", response_model=TreatmentPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_new_treatment_plan(
    plan: TreatmentPlanCreate,
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    return create_plan(db, clinic_id, plan)


# ---------------------------------------------------------------------------
# Patient Treatments
# ---------------------------------------------------------------------------

@router.get("/api/patient-treatments", response_model=list[PatientTreatmentResponse])
async def list_patient_treatments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    return get_treatments(db, clinic_id, skip=skip, limit=limit)


@router.get("/api/patient-treatments/{uid}", response_model=list[PatientTreatmentResponse])
async def list_patient_treatments_by_patient(
    uid: str,
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    return get_treatments_by_patient(db, clinic_id, uid)


@router.post("/api/patient-treatments", response_model=PatientTreatmentResponse, status_code=status.HTTP_201_CREATED)
async def create_new_patient_treatment(
    treatment: PatientTreatmentCreate,
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    return create_treatment(db, clinic_id, treatment)


@router.put("/api/patient-treatments/{treatment_id}", response_model=PatientTreatmentResponse)
async def update_patient_treatment_detail(
    treatment_id: int,
    treatment: PatientTreatmentUpdate,
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    db_treatment = update_treatment(db, treatment_id, clinic_id, treatment)
    if not db_treatment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient treatment not found")
    return db_treatment


@router.delete("/api/patient-treatments/{treatment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_patient_treatment_record(
    treatment_id: int,
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    if not delete_treatment(db, treatment_id, clinic_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient treatment not found")
