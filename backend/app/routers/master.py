from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.deps import get_clinic_id
from app.schemas.master import MasterResponse
from app.services.master_service import (
    get_all_medicines, get_all_doses, get_all_frequencies,
    get_all_durations, get_all_quantities, get_all_notes,
)

router = APIRouter(prefix="/api/master", tags=["master"])


@router.get("/medicines", response_model=list[MasterResponse])
async def list_medicines(
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    return get_all_medicines(db)


@router.get("/doses", response_model=list[MasterResponse])
async def list_doses(
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    return get_all_doses(db)


@router.get("/frequencies", response_model=list[MasterResponse])
async def list_frequencies(
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    return get_all_frequencies(db)


@router.get("/durations", response_model=list[MasterResponse])
async def list_durations(
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    return get_all_durations(db)


@router.get("/quantities", response_model=list[MasterResponse])
async def list_quantities(
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    return get_all_quantities(db)


@router.get("/notes", response_model=list[MasterResponse])
async def list_notes(
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    return get_all_notes(db)
