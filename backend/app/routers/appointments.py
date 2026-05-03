from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.deps import get_clinic_id
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate, AppointmentResponse
from app.services.appointment_service import (
    get_appointments, get_today_count, create_appointment,
    update_appointment, update_status,
)

router = APIRouter(prefix="/api/appointments", tags=["appointments"])


@router.get("", response_model=list[AppointmentResponse])
async def list_appointments(
    date: str = Query(None, description="Filter by date (YYYY-MM-DD)"),
    status: str = Query(None, description="Filter by status (pending/completed)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    from datetime import datetime
    appointment_date = None
    if date:
        appointment_date = datetime.strptime(date, "%Y-%m-%d").date()
    return get_appointments(db, clinic_id, appointment_date=appointment_date, status=status, skip=skip, limit=limit)


@router.get("/today-count")
async def today_appointment_count(
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    count = get_today_count(db, clinic_id)
    return {"count": count}


@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def create_new_appointment(
    appointment: AppointmentCreate,
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    return create_appointment(db, clinic_id, appointment)


@router.put("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment_detail(
    appointment_id: int,
    appointment: AppointmentUpdate,
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    db_appointment = update_appointment(db, appointment_id, clinic_id, appointment)
    if not db_appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return db_appointment


@router.put("/{appointment_id}/status", response_model=AppointmentResponse)
async def update_appointment_status(
    appointment_id: int,
    status: str = Query(..., description="New status (pending/completed)"),
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    db_appointment = update_status(db, appointment_id, clinic_id, status)
    if not db_appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return db_appointment
