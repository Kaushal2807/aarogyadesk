from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from datetime import date
from app.models.appointment import Appointment
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate


def get_appointments(
    db: Session,
    clinic_id: int,
    appointment_date: date = None,
    status: str = None,
    search: str = None,
    skip: int = 0,
    limit: int = 20,
):
    query = db.query(Appointment).filter(Appointment.clinic_id == clinic_id)
    if appointment_date:
        query = query.filter(Appointment.appointment_date == appointment_date)
    if status:
        query = query.filter(Appointment.status == status)
    if search:
        search = search.strip()
        pattern = f"%{search}%"
        query = query.filter(
            or_(
                Appointment.patient_name.ilike(pattern),
                Appointment.contact_number.ilike(pattern),
            )
        )
    return query.order_by(Appointment.appointment_date, Appointment.appointment_time).offset(skip).limit(limit).all()


def get_appointments_count(
    db: Session,
    clinic_id: int,
    appointment_date: date = None,
    status: str = None,
    search: str = None,
):
    query = db.query(func.count(Appointment.id)).filter(Appointment.clinic_id == clinic_id)
    if appointment_date:
        query = query.filter(Appointment.appointment_date == appointment_date)
    if status:
        query = query.filter(Appointment.status == status)
    if search:
        search = search.strip()
        pattern = f"%{search}%"
        query = query.filter(
            or_(
                Appointment.patient_name.ilike(pattern),
                Appointment.contact_number.ilike(pattern),
            )
        )
    return query.scalar() or 0


def get_today_count(db: Session, clinic_id: int):
    today = date.today()
    return db.query(func.count(Appointment.id)).filter(
        Appointment.clinic_id == clinic_id,
        Appointment.appointment_date == today,
    ).scalar()


def create_appointment(db: Session, clinic_id: int, data: AppointmentCreate):
    db_appointment = Appointment(clinic_id=clinic_id, **data.dict())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment


def update_appointment(db: Session, appointment_id: int, clinic_id: int, data: AppointmentUpdate):
    db_appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.clinic_id == clinic_id,
    ).first()
    if not db_appointment:
        return None
    for field, value in data.dict(exclude_unset=True).items():
        setattr(db_appointment, field, value)
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment


def update_status(db: Session, appointment_id: int, clinic_id: int, status: str):
    db_appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.clinic_id == clinic_id,
    ).first()
    if not db_appointment:
        return None
    db_appointment.status = status
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment
