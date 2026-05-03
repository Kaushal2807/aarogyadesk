from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.models.patient import Patient
from app.models.clinic import ClinicData
from app.schemas.patient import PatientCreate, PatientUpdate


def get_patient_by_uid(db: Session, clinic_id: int, patient_uid: str):
    return db.query(Patient).filter(
        Patient.clinic_id == clinic_id,
        Patient.patient_uid == patient_uid
    ).first()


def get_patients(db: Session, clinic_id: int, skip: int = 0, limit: int = 100, search: str = None,
                 payment_status: str = None):
    query = db.query(Patient).filter(Patient.clinic_id == clinic_id)
    if search:
        q = f"%{search}%"
        query = query.filter(
            or_(Patient.patient_uid.ilike(q), Patient.name.ilike(q))
        )
    if payment_status:
        query = query.filter(Patient.payment_status == payment_status)
    return query.order_by(Patient.created_at.desc()).offset(skip).limit(limit).all()


def get_patient_count(db: Session, clinic_id: int, payment_status: str = None):
    query = db.query(func.count(Patient.id)).filter(Patient.clinic_id == clinic_id)
    if payment_status:
        query = query.filter(Patient.payment_status == payment_status)
    return query.scalar()


def generate_patient_uid(db: Session, clinic_id: int) -> str:
    clinic = db.query(ClinicData).filter(ClinicData.clinic_id == clinic_id).first()
    if not clinic:
        return "GEN-1"
    prefix = clinic.clinic_code
    last = db.query(func.max(Patient.id)).filter(Patient.clinic_id == clinic_id).scalar() or 0
    return f"{prefix}-{last + 101}"


def create_patient(db: Session, clinic_id: int, patient: PatientCreate):
    uid = generate_patient_uid(db, clinic_id)
    db_patient = Patient(clinic_id=clinic_id, patient_uid=uid, **patient.dict())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient


def update_patient(db: Session, clinic_id: int, patient_uid: str, patient: PatientUpdate):
    db_patient = get_patient_by_uid(db, clinic_id, patient_uid)
    if not db_patient:
        return None
    for field, value in patient.dict(exclude_unset=True).items():
        setattr(db_patient, field, value)
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient


def delete_patient(db: Session, clinic_id: int, patient_uid: str):
    db_patient = get_patient_by_uid(db, clinic_id, patient_uid)
    if not db_patient:
        return False
    db.delete(db_patient)
    db.commit()
    return True
