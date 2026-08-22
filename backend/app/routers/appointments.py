from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.deps import get_clinic_id
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate, AppointmentResponse, AppointmentFilter, AppointmentPaginatedResponse
from app.services.appointment_service import (
    get_appointments, get_appointments_count, get_today_count, create_appointment,
    update_appointment, update_status,
)

router = APIRouter(prefix="/api/appointments", tags=["appointments"])


@router.post("/get", response_model=AppointmentPaginatedResponse)
def list_appointments(
    filters: AppointmentFilter,
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    items = get_appointments(
        db,
        clinic_id,
        appointment_date=filters.date,
        status=filters.status,
        search=filters.search,
        skip=filters.skip,
        limit=filters.limit,
    )
    total = get_appointments_count(
        db,
        clinic_id,
        appointment_date=filters.date,
        status=filters.status,
        search=filters.search,
    )
    return AppointmentPaginatedResponse(
        items=items,
        total=total,
        skip=filters.skip,
        limit=filters.limit,
    )


@router.get("/today-count")
def today_appointment_count(
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    count = get_today_count(db, clinic_id)
    return {"count": count}


@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_new_appointment(
    appointment: AppointmentCreate,
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    return create_appointment(db, clinic_id, appointment)


@router.put("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment_detail(
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
def update_appointment_status(
    appointment_id: int,
    status: str = Query(..., description="New status (pending/completed)"),
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    db_appointment = update_status(db, appointment_id, clinic_id, status)
    if not db_appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return db_appointment
