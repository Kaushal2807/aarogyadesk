from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
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


@router.get("/work-done", response_model=list[WorkDoneResponse])
async def list_work_types(db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    return get_work_done_types(db, clinic_id)


@router.post("/work-done", response_model=WorkDoneResponse, status_code=status.HTTP_201_CREATED)
async def add_work_type(data: WorkDoneCreate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    return create_work_done_type(db, clinic_id, data)


@router.put("/work-done/{work_id}", response_model=WorkDoneResponse)
async def edit_work_type(work_id: int, data: WorkDoneUpdate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    result = update_work_done_type(db, clinic_id, work_id, data)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work type not found")
    return result


@router.delete("/work-done/{work_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_work_type(work_id: int, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    if not delete_work_done_type(db, clinic_id, work_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work type not found")


@router.get("/patient-work-done", response_model=list[PatientWorkDoneResponse])
async def list_patient_work(db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    return get_patient_work_done(db, clinic_id)


@router.get("/patient-work-done/{uid}", response_model=list[PatientWorkDoneResponse])
async def list_patient_work_by_uid(uid: str, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    return get_patient_work_done_by_uid(db, clinic_id, uid)


@router.post("/patient-work-done", response_model=PatientWorkDoneResponse, status_code=status.HTTP_201_CREATED)
async def add_patient_work(data: PatientWorkDoneCreate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    return create_patient_work_done(db, clinic_id, data)


@router.put("/patient-work-done/{work_id}", response_model=PatientWorkDoneResponse)
async def edit_patient_work(work_id: int, data: PatientWorkDoneUpdate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    result = update_patient_work_done(db, clinic_id, work_id, data)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")
    return result


@router.delete("/patient-work-done/{work_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_patient_work(work_id: int, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    if not delete_patient_work_done(db, clinic_id, work_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")
