from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.cache import cache_delete_pattern, cache_get, cache_set
from app.db.database import get_db
from app.deps import get_clinic_id
from app.schemas.clinic_doctor import ClinicDoctorCreate, ClinicDoctorUpdate, ClinicDoctorResponse
from app.services.clinic_doctor_service import get_doctors, create_doctor, update_doctor, delete_doctor

router = APIRouter(prefix="/api/doctors", tags=["doctors"])

DOCTORS_CACHE_TTL_SECONDS = 1800


def _doctors_cache_key(clinic_id: int) -> str:
    return f"clinic:{clinic_id}:doctors:list"


def _invalidate_doctors(clinic_id: int) -> None:
    cache_delete_pattern(_doctors_cache_key(clinic_id))


@router.get("", response_model=list[ClinicDoctorResponse])
def list_doctors(db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    key = _doctors_cache_key(clinic_id)
    cached = cache_get(key)
    if cached is not None:
        return cached

    data = get_doctors(db, clinic_id)
    cache_set(key, data, DOCTORS_CACHE_TTL_SECONDS)
    return data


@router.post("", response_model=ClinicDoctorResponse, status_code=status.HTTP_201_CREATED)
def add_doctor(data: ClinicDoctorCreate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    result = create_doctor(db, clinic_id, data)
    _invalidate_doctors(clinic_id)
    return result


@router.put("/{doctor_id}", response_model=ClinicDoctorResponse)
def edit_doctor(doctor_id: int, data: ClinicDoctorUpdate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    result = update_doctor(db, clinic_id, doctor_id, data)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    _invalidate_doctors(clinic_id)
    return result


@router.delete("/{doctor_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_doctor(doctor_id: int, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    if not delete_doctor(db, clinic_id, doctor_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    _invalidate_doctors(clinic_id)
