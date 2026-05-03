from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.deps import require_admin
from app.schemas.clinic import ClinicCreate, ClinicUpdate, ClinicResponse
from app.services.clinic_service import get_clinics, get_clinic, create_clinic, update_clinic, delete_clinic
from app.models.user import User

router = APIRouter(prefix="/api/clinics", tags=["clinics"])


@router.get("", response_model=list[ClinicResponse])
async def list_clinics(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return get_clinics(db)


@router.post("", response_model=ClinicResponse, status_code=status.HTTP_201_CREATED)
async def add_clinic(data: ClinicCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return create_clinic(db, data)


@router.get("/{clinic_id}", response_model=ClinicResponse)
async def clinic_detail(clinic_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    result = get_clinic(db, clinic_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clinic not found")
    return result


@router.put("/{clinic_id}", response_model=ClinicResponse)
async def edit_clinic(clinic_id: int, data: ClinicUpdate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    result = update_clinic(db, clinic_id, data)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clinic not found")
    return result


@router.delete("/{clinic_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_clinic(clinic_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    if not delete_clinic(db, clinic_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clinic not found")
