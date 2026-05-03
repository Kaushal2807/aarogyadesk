from sqlalchemy.orm import Session
from app.models.clinic import ClinicData
from app.schemas.clinic import ClinicCreate, ClinicUpdate


def get_clinics(db: Session, skip: int = 0, limit: int = 100, search: str = None):
    query = db.query(ClinicData)
    if search:
        q = f"%{search}%"
        query = query.filter(
            ClinicData.clinic_name.ilike(q)
            | ClinicData.clinic_code.ilike(q)
            | ClinicData.email.ilike(q)
        )
    return query.order_by(ClinicData.created_at.desc()).offset(skip).limit(limit).all()


def get_clinic(db: Session, clinic_id: int):
    return db.query(ClinicData).filter(ClinicData.clinic_id == clinic_id).first()


def create_clinic(db: Session, data: ClinicCreate):
    clinic = ClinicData(**data.model_dump())
    db.add(clinic)
    db.commit()
    db.refresh(clinic)
    return clinic


def update_clinic(db: Session, clinic_id: int, data: ClinicUpdate):
    clinic = get_clinic(db, clinic_id)
    if not clinic:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(clinic, field, value)
    db.add(clinic)
    db.commit()
    db.refresh(clinic)
    return clinic


def delete_clinic(db: Session, clinic_id: int):
    clinic = get_clinic(db, clinic_id)
    if not clinic:
        return False
    db.delete(clinic)
    db.commit()
    return True
