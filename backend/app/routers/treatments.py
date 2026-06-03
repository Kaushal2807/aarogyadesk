from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.cache import cache_delete_pattern, cache_get, cache_set
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

router = APIRouter(prefix="/api", tags=["treatments"])

TREATMENT_PLANS_CACHE_TTL_SECONDS = 1800


def _treatment_plans_cache_key(clinic_id: int, skip: int, limit: int, search: str | None) -> str:
    search_key = search or ""
    return f"clinic:{clinic_id}:treatment-plans:skip:{skip}:limit:{limit}:search:{search_key}"


def _invalidate_treatment_plans(clinic_id: int) -> None:
    cache_delete_pattern(f"clinic:{clinic_id}:treatment-plans:*")


# ---------------------------------------------------------------------------
# Treatment Plans
# ---------------------------------------------------------------------------

@router.get("/treatment-plans", response_model=list[TreatmentPlanResponse])
def list_treatment_plans(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: str = Query(None),
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    key = _treatment_plans_cache_key(clinic_id, skip, limit, search)
    cached = cache_get(key)
    if cached is not None:
        return cached

    data = get_plans(db, clinic_id, skip=skip, limit=limit, search=search)
    cache_set(key, data, TREATMENT_PLANS_CACHE_TTL_SECONDS)
    return data


@router.post("/treatment-plans", response_model=TreatmentPlanResponse, status_code=status.HTTP_201_CREATED)
def create_new_treatment_plan(
    plan: TreatmentPlanCreate,
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    result = create_plan(db, clinic_id, plan)
    _invalidate_treatment_plans(clinic_id)
    return result


# ---------------------------------------------------------------------------
# Patient Treatments
# ---------------------------------------------------------------------------

@router.get("/patient-treatments", response_model=list[PatientTreatmentResponse])
def list_patient_treatments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    return get_treatments(db, clinic_id, skip=skip, limit=limit)


@router.get("/patient-treatments/{uid}", response_model=list[PatientTreatmentResponse])
def list_patient_treatments_by_patient(
    uid: str,
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    return get_treatments_by_patient(db, clinic_id, uid)


@router.post("/patient-treatments", response_model=PatientTreatmentResponse, status_code=status.HTTP_201_CREATED)
def create_new_patient_treatment(
    treatment: PatientTreatmentCreate,
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    return create_treatment(db, clinic_id, treatment)


@router.put("/patient-treatments/{treatment_id}", response_model=PatientTreatmentResponse)
def update_patient_treatment_detail(
    treatment_id: int,
    treatment: PatientTreatmentUpdate,
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    db_treatment = update_treatment(db, treatment_id, clinic_id, treatment)
    if not db_treatment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient treatment not found")
    return db_treatment


@router.delete("/patient-treatments/{treatment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient_treatment_record(
    treatment_id: int,
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    if not delete_treatment(db, treatment_id, clinic_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient treatment not found")
