from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.cache import cache_delete_pattern, cache_get, cache_set
from app.db.database import get_db
from app.deps import get_clinic_id
from app.schemas.work_done import (
    WorkDoneCreate, WorkDoneUpdate, WorkDoneResponse,
    PatientWorkDoneCreate, PatientWorkDoneUpdate, PatientWorkDoneResponse,
)
from app.services.work_done_service import (
    get_work_done_types, create_work_done_type, update_work_done_type, delete_work_done_type,
    get_patient_work_done, get_patient_work_done_by_uid,
    create_patient_work_done, update_patient_work_done, delete_patient_work_done,
)

router = APIRouter(prefix="/api", tags=["work-done"])

WORK_DONE_TYPES_CACHE_TTL_SECONDS = 1800


def _work_done_types_cache_key(clinic_id: int) -> str:
    return f"clinic:{clinic_id}:work-done-types:list"


def _invalidate_work_done_types(clinic_id: int) -> None:
    cache_delete_pattern(_work_done_types_cache_key(clinic_id))


@router.get("/work-done", response_model=list[WorkDoneResponse])
def list_work_types(db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    key = _work_done_types_cache_key(clinic_id)
    cached = cache_get(key)
    if cached is not None:
        return cached

    data = get_work_done_types(db, clinic_id)
    cache_set(key, data, WORK_DONE_TYPES_CACHE_TTL_SECONDS)
    return data


@router.post("/work-done", response_model=WorkDoneResponse, status_code=status.HTTP_201_CREATED)
def add_work_type(data: WorkDoneCreate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    result = create_work_done_type(db, clinic_id, data)
    _invalidate_work_done_types(clinic_id)
    return result


@router.put("/work-done/{work_id}", response_model=WorkDoneResponse)
def edit_work_type(work_id: int, data: WorkDoneUpdate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    result = update_work_done_type(db, clinic_id, work_id, data)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work type not found")
    _invalidate_work_done_types(clinic_id)
    return result


@router.delete("/work-done/{work_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_work_type(work_id: int, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    if not delete_work_done_type(db, clinic_id, work_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work type not found")
    _invalidate_work_done_types(clinic_id)


@router.get("/patient-work-done", response_model=list[PatientWorkDoneResponse])
def list_patient_work(db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    return get_patient_work_done(db, clinic_id)


@router.get("/patient-work-done/{uid}", response_model=list[PatientWorkDoneResponse])
def list_patient_work_by_uid(uid: str, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    return get_patient_work_done_by_uid(db, clinic_id, uid)


@router.post("/patient-work-done", response_model=PatientWorkDoneResponse, status_code=status.HTTP_201_CREATED)
def add_patient_work(data: PatientWorkDoneCreate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    return create_patient_work_done(db, clinic_id, data)


@router.put("/patient-work-done/{work_id}", response_model=PatientWorkDoneResponse)
def edit_patient_work(work_id: int, data: PatientWorkDoneUpdate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    result = update_patient_work_done(db, clinic_id, work_id, data)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")
    return result


@router.delete("/patient-work-done/{work_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_patient_work(work_id: int, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    if not delete_patient_work_done(db, clinic_id, work_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")
