from sqlalchemy.orm import Session
from app.models.master import (
    MasterMedicine, MasterDose, MasterFrequency, MasterDuration, MasterQuantity, MasterNotes,
)


def get_all_medicines(db: Session, clinic_id: int):
    return db.query(MasterMedicine).filter(MasterMedicine.clinic_id == clinic_id).order_by(MasterMedicine.name).all()


def get_all_doses(db: Session, clinic_id: int):
    return db.query(MasterDose).filter(MasterDose.clinic_id == clinic_id).order_by(MasterDose.name).all()


def get_all_frequencies(db: Session, clinic_id: int):
    return db.query(MasterFrequency).filter(MasterFrequency.clinic_id == clinic_id).order_by(MasterFrequency.name).all()


def get_all_durations(db: Session, clinic_id: int):
    return db.query(MasterDuration).filter(MasterDuration.clinic_id == clinic_id).order_by(MasterDuration.name).all()


def get_all_quantities(db: Session, clinic_id: int):
    return db.query(MasterQuantity).filter(MasterQuantity.clinic_id == clinic_id).order_by(MasterQuantity.name).all()


def get_all_notes(db: Session, clinic_id: int):
    return db.query(MasterNotes).filter(MasterNotes.clinic_id == clinic_id).order_by(MasterNotes.name).all()


# Create / Update / Delete helpers for master tables
def create_medicine(db: Session, clinic_id: int, name: str):
    item = MasterMedicine(clinic_id=clinic_id, name=name)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_medicine(db: Session, clinic_id: int, item_id: int, name: str):
    item = db.query(MasterMedicine).filter(MasterMedicine.clinic_id == clinic_id, MasterMedicine.id == item_id).first()
    if not item:
        return None
    item.name = name
    db.commit()
    db.refresh(item)
    return item


def delete_medicine(db: Session, clinic_id: int, item_id: int):
    item = db.query(MasterMedicine).filter(MasterMedicine.clinic_id == clinic_id, MasterMedicine.id == item_id).first()
    if not item:
        return False
    db.delete(item)
    db.commit()
    return True


def create_dose(db: Session, clinic_id: int, name: str):
    item = MasterDose(clinic_id=clinic_id, name=name)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_dose(db: Session, clinic_id: int, item_id: int, name: str):
    item = db.query(MasterDose).filter(MasterDose.clinic_id == clinic_id, MasterDose.id == item_id).first()
    if not item:
        return None
    item.name = name
    db.commit()
    db.refresh(item)
    return item


def delete_dose(db: Session, clinic_id: int, item_id: int):
    item = db.query(MasterDose).filter(MasterDose.clinic_id == clinic_id, MasterDose.id == item_id).first()
    if not item:
        return False
    db.delete(item)
    db.commit()
    return True


def create_frequency(db: Session, clinic_id: int, name: str):
    item = MasterFrequency(clinic_id=clinic_id, name=name)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_frequency(db: Session, clinic_id: int, item_id: int, name: str):
    item = db.query(MasterFrequency).filter(MasterFrequency.clinic_id == clinic_id, MasterFrequency.id == item_id).first()
    if not item:
        return None
    item.name = name
    db.commit()
    db.refresh(item)
    return item


def delete_frequency(db: Session, clinic_id: int, item_id: int):
    item = db.query(MasterFrequency).filter(MasterFrequency.clinic_id == clinic_id, MasterFrequency.id == item_id).first()
    if not item:
        return False
    db.delete(item)
    db.commit()
    return True


def create_duration(db: Session, clinic_id: int, name: str):
    item = MasterDuration(clinic_id=clinic_id, name=name)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_duration(db: Session, clinic_id: int, item_id: int, name: str):
    item = db.query(MasterDuration).filter(MasterDuration.clinic_id == clinic_id, MasterDuration.id == item_id).first()
    if not item:
        return None
    item.name = name
    db.commit()
    db.refresh(item)
    return item


def delete_duration(db: Session, clinic_id: int, item_id: int):
    item = db.query(MasterDuration).filter(MasterDuration.clinic_id == clinic_id, MasterDuration.id == item_id).first()
    if not item:
        return False
    db.delete(item)
    db.commit()
    return True


def create_quantity(db: Session, clinic_id: int, name: str):
    item = MasterQuantity(clinic_id=clinic_id, name=name)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_quantity(db: Session, clinic_id: int, item_id: int, name: str):
    item = db.query(MasterQuantity).filter(MasterQuantity.clinic_id == clinic_id, MasterQuantity.id == item_id).first()
    if not item:
        return None
    item.name = name
    db.commit()
    db.refresh(item)
    return item


def delete_quantity(db: Session, clinic_id: int, item_id: int):
    item = db.query(MasterQuantity).filter(MasterQuantity.clinic_id == clinic_id, MasterQuantity.id == item_id).first()
    if not item:
        return False
    db.delete(item)
    db.commit()
    return True


def create_note(db: Session, clinic_id: int, name: str):
    item = MasterNotes(clinic_id=clinic_id, name=name)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_note(db: Session, clinic_id: int, item_id: int, name: str):
    item = db.query(MasterNotes).filter(MasterNotes.clinic_id == clinic_id, MasterNotes.id == item_id).first()
    if not item:
        return None
    item.name = name
    db.commit()
    db.refresh(item)
    return item


def delete_note(db: Session, clinic_id: int, item_id: int):
    item = db.query(MasterNotes).filter(MasterNotes.clinic_id == clinic_id, MasterNotes.id == item_id).first()
    if not item:
        return False
    db.delete(item)
    db.commit()
    return True
