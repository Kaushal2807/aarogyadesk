from sqlalchemy.orm import Session
from app.models.master import (
    MasterMedicine, MasterDose, MasterFrequency, MasterDuration, MasterQuantity, MasterNotes,
)


def get_all_medicines(db: Session):
    return db.query(MasterMedicine).order_by(MasterMedicine.name).all()


def get_all_doses(db: Session):
    return db.query(MasterDose).order_by(MasterDose.name).all()


def get_all_frequencies(db: Session):
    return db.query(MasterFrequency).order_by(MasterFrequency.name).all()


def get_all_durations(db: Session):
    return db.query(MasterDuration).order_by(MasterDuration.name).all()


def get_all_quantities(db: Session):
    return db.query(MasterQuantity).order_by(MasterQuantity.name).all()


def get_all_notes(db: Session):
    return db.query(MasterNotes).order_by(MasterNotes.name).all()
