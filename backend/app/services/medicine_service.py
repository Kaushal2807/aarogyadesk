from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.medicine import Medicine
from app.schemas.medicine import MedicineCreate, MedicineUpdate


def get_medicines(
    db: Session, clinic_id: int, skip: int = 0, limit: int = 100, search: str = None
):
    query = db.query(Medicine).filter(Medicine.clinic_id == clinic_id)
    if search:
        q = f"%{search}%"
        query = query.filter(Medicine.name.ilike(q))
    return query.order_by(Medicine.name).offset(skip).limit(limit).all()


def get_medicine(db: Session, clinic_id: int, medicine_id: int):
    return (
        db.query(Medicine)
        .filter(Medicine.clinic_id == clinic_id, Medicine.id == medicine_id)
        .first()
    )


def create_medicine(db: Session, clinic_id: int, data: MedicineCreate):
    medicine = Medicine(clinic_id=clinic_id, **data.model_dump())
    db.add(medicine)
    db.commit()
    db.refresh(medicine)
    return medicine


def update_medicine(db: Session, clinic_id: int, medicine_id: int, data: MedicineUpdate):
    medicine = get_medicine(db, clinic_id, medicine_id)
    if not medicine:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(medicine, field, value)
    db.add(medicine)
    db.commit()
    db.refresh(medicine)
    return medicine


def delete_medicine(db: Session, clinic_id: int, medicine_id: int):
    medicine = get_medicine(db, clinic_id, medicine_id)
    if not medicine:
        return False
    db.delete(medicine)
    db.commit()
    return True


def get_low_stock(db: Session, clinic_id: int):
    """Return medicines where quantity <= threshold_level."""
    return (
        db.query(Medicine)
        .filter(
            Medicine.clinic_id == clinic_id,
            Medicine.quantity <= Medicine.threshold_level,
        )
        .order_by(Medicine.name)
        .all()
    )
