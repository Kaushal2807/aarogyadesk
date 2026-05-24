from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.deps import get_clinic_id
from app.schemas.clinic_doctor import ClinicDoctorCreate, ClinicDoctorUpdate, ClinicDoctorResponse
from app.services.clinic_doctor_service import get_doctors, create_doctor, update_doctor, delete_doctor

router = APIRouter(prefix="/api/doctors", tags=["doctors"])


@router.get("", response_model=list[ClinicDoctorResponse])
def list_doctors(db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    return get_doctors(db, clinic_id)


@router.post("", response_model=ClinicDoctorResponse, status_code=status.HTTP_201_CREATED)
def add_doctor(data: ClinicDoctorCreate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    return create_doctor(db, clinic_id, data)


@router.put("/{doctor_id}", response_model=ClinicDoctorResponse)
def edit_doctor(doctor_id: int, data: ClinicDoctorUpdate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    result = update_doctor(db, doctor_id, clinic_id, data)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    return result


@router.delete("/{doctor_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_doctor(doctor_id: int, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    if not delete_doctor(db, doctor_id, clinic_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
