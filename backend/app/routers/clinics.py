from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.deps import require_admin
from app.schemas.clinic import ClinicCreate, ClinicUpdate, ClinicResponse
from app.services.clinic_service import get_clinics, get_clinic, create_clinic, update_clinic, delete_clinic
from app.models.user import User
from app.deps import get_current_user

router = APIRouter(prefix="/api/clinics", tags=["clinics"])


@router.get("", response_model=list[ClinicResponse])
def list_clinics(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return get_clinics(db)


@router.post("", response_model=ClinicResponse, status_code=status.HTTP_201_CREATED)
def add_clinic(data: ClinicCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return create_clinic(db, data)


@router.get("/me", response_model=ClinicResponse)
def my_clinic(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if not user.clinic_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No clinic assigned")
    result = get_clinic(db, user.clinic_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clinic not found")
    return result


@router.get("/{clinic_id}", response_model=ClinicResponse)
def clinic_detail(clinic_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.user_type != "admin" and user.clinic_id != clinic_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    result = get_clinic(db, clinic_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clinic not found")
    return result


@router.put("/{clinic_id}", response_model=ClinicResponse)
def edit_clinic(clinic_id: int, data: ClinicUpdate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    result = update_clinic(db, clinic_id, data)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clinic not found")
    return result


@router.delete("/{clinic_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_clinic(clinic_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    if not delete_clinic(db, clinic_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clinic not found")
