from sqlalchemy.orm import Session
from app.models.master_treatment import MasterDiagnosis, MasterTreatmentPlan
from app.schemas.master_treatment import (
    MasterDiagnosisCreate, MasterDiagnosisUpdate,
    MasterTreatmentCreate, MasterTreatmentUpdate
)


# ── Master Diagnosis ──

def get_diagnoses(db: Session, clinic_id: int, skip: int = 0, limit: int = 100):
    return (
        db.query(MasterDiagnosis)
        .filter(MasterDiagnosis.clinic_id == clinic_id)
        .order_by(MasterDiagnosis.diagnosis_name)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_diagnosis(db: Session, clinic_id: int, diagnosis_id: int):
    return (
        db.query(MasterDiagnosis)
        .filter(
            MasterDiagnosis.id == diagnosis_id,
            MasterDiagnosis.clinic_id == clinic_id
        )
        .first()
    )


def create_diagnosis(db: Session, clinic_id: int, data: MasterDiagnosisCreate):
    db_diagnosis = MasterDiagnosis(clinic_id=clinic_id, **data.dict())
    db.add(db_diagnosis)
    db.commit()
    db.refresh(db_diagnosis)
    return db_diagnosis


def update_diagnosis(db: Session, clinic_id: int, diagnosis_id: int, data: MasterDiagnosisUpdate):
    db_diagnosis = get_diagnosis(db, clinic_id, diagnosis_id)
    if not db_diagnosis:
        return None
    for field, value in data.dict(exclude_unset=True).items():
        setattr(db_diagnosis, field, value)
    db.add(db_diagnosis)
    db.commit()
    db.refresh(db_diagnosis)
    return db_diagnosis


def delete_diagnosis(db: Session, clinic_id: int, diagnosis_id: int):
    db_diagnosis = get_diagnosis(db, clinic_id, diagnosis_id)
    if not db_diagnosis:
        return False
    db.delete(db_diagnosis)
    db.commit()
    return True


# ── Master Treatment Plans ──

def get_treatments(db: Session, clinic_id: int, skip: int = 0, limit: int = 100):
    return (
        db.query(MasterTreatmentPlan)
        .filter(MasterTreatmentPlan.clinic_id == clinic_id)
        .order_by(MasterTreatmentPlan.treatment_name)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_treatment(db: Session, clinic_id: int, treatment_id: int):
    return (
        db.query(MasterTreatmentPlan)
        .filter(
            MasterTreatmentPlan.id == treatment_id,
            MasterTreatmentPlan.clinic_id == clinic_id
        )
        .first()
    )


def create_treatment(db: Session, clinic_id: int, data: MasterTreatmentCreate):
    db_treatment = MasterTreatmentPlan(clinic_id=clinic_id, **data.dict())
    db.add(db_treatment)
    db.commit()
    db.refresh(db_treatment)
    return db_treatment


def update_treatment(db: Session, clinic_id: int, treatment_id: int, data: MasterTreatmentUpdate):
    db_treatment = get_treatment(db, clinic_id, treatment_id)
    if not db_treatment:
        return None
    for field, value in data.dict(exclude_unset=True).items():
        setattr(db_treatment, field, value)
    db.add(db_treatment)
    db.commit()
    db.refresh(db_treatment)
    return db_treatment


def delete_treatment(db: Session, clinic_id: int, treatment_id: int):
    db_treatment = get_treatment(db, clinic_id, treatment_id)
    if not db_treatment:
        return False
    db.delete(db_treatment)
    db.commit()
    return True
