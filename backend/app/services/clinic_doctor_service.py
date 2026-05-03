from sqlalchemy.orm import Session
from app.models.clinic_doctor import ClinicDoctor
from app.schemas.clinic_doctor import ClinicDoctorCreate, ClinicDoctorUpdate


def get_doctors(db: Session, clinic_id: int, skip: int = 0, limit: int = 100):
    return (
        db.query(ClinicDoctor)
        .filter(ClinicDoctor.clinic_id == clinic_id)
        .order_by(ClinicDoctor.doctor_name)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_doctor(db: Session, clinic_id: int, doctor_id: int):
    return (
        db.query(ClinicDoctor)
        .filter(ClinicDoctor.clinic_id == clinic_id, ClinicDoctor.id == doctor_id)
        .first()
    )


def create_doctor(db: Session, clinic_id: int, data: ClinicDoctorCreate):
    doctor = ClinicDoctor(clinic_id=clinic_id, **data.model_dump())
    db.add(doctor)
    db.commit()
    db.refresh(doctor)
    return doctor


def update_doctor(db: Session, clinic_id: int, doctor_id: int, data: ClinicDoctorUpdate):
    doctor = get_doctor(db, clinic_id, doctor_id)
    if not doctor:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(doctor, field, value)
    db.add(doctor)
    db.commit()
    db.refresh(doctor)
    return doctor


def delete_doctor(db: Session, clinic_id: int, doctor_id: int):
    doctor = get_doctor(db, clinic_id, doctor_id)
    if not doctor:
        return False
    db.delete(doctor)
    db.commit()
    return True
