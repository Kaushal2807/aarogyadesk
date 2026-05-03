from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.treatment_plan import TreatmentPlan
from app.models.patient_treatment import PatientTreatment
from app.schemas.treatment import TreatmentPlanCreate, TreatmentPlanUpdate, PatientTreatmentCreate, PatientTreatmentUpdate


# ---------------------------------------------------------------------------
# Treatment Plans
# ---------------------------------------------------------------------------

def get_plans(db: Session, clinic_id: int, skip: int = 0, limit: int = 100, search: str = None):
    query = db.query(TreatmentPlan).filter(TreatmentPlan.clinic_id == clinic_id)
    if search:
        q = f"%{search}%"
        query = query.filter(
            or_(TreatmentPlan.diagnosis.ilike(q), TreatmentPlan.treatment.ilike(q))
        )
    return query.order_by(TreatmentPlan.created_at.desc()).offset(skip).limit(limit).all()


def create_plan(db: Session, clinic_id: int, data: TreatmentPlanCreate):
    db_plan = TreatmentPlan(clinic_id=clinic_id, **data.dict())
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan


def update_plan(db: Session, plan_id: int, clinic_id: int, data: TreatmentPlanUpdate):
    db_plan = db.query(TreatmentPlan).filter(
        TreatmentPlan.id == plan_id,
        TreatmentPlan.clinic_id == clinic_id,
    ).first()
    if not db_plan:
        return None
    for field, value in data.dict(exclude_unset=True).items():
        setattr(db_plan, field, value)
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan


# ---------------------------------------------------------------------------
# Patient Treatments
# ---------------------------------------------------------------------------

def get_treatments(db: Session, clinic_id: int, skip: int = 0, limit: int = 100):
    return (
        db.query(PatientTreatment)
        .filter(PatientTreatment.clinic_id == clinic_id)
        .order_by(PatientTreatment.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_treatments_by_patient(db: Session, clinic_id: int, patient_uid: str):
    return (
        db.query(PatientTreatment)
        .filter(
            PatientTreatment.clinic_id == clinic_id,
            PatientTreatment.patient_uid == patient_uid,
        )
        .order_by(PatientTreatment.created_at.desc())
        .all()
    )


def _enrich_patient_treatment(db: Session, treatment: PatientTreatment):
    """Attach diagnosis and treatment names onto a PatientTreatment object."""
    if treatment.diagnosis_id:
        plan = db.query(TreatmentPlan).filter(TreatmentPlan.id == treatment.diagnosis_id).first()
        treatment.diagnosis = plan.diagnosis if plan else None
    if treatment.treatment_id:
        plan = db.query(TreatmentPlan).filter(TreatmentPlan.id == treatment.treatment_id).first()
        treatment.treatment = plan.treatment if plan else None
    return treatment


def get_treatment_by_id(db: Session, treatment_id: int, clinic_id: int):
    treatment = db.query(PatientTreatment).filter(
        PatientTreatment.id == treatment_id,
        PatientTreatment.clinic_id == clinic_id,
    ).first()
    if treatment:
        _enrich_patient_treatment(db, treatment)
    return treatment


def create_treatment(db: Session, clinic_id: int, data: PatientTreatmentCreate):
    db_treatment = PatientTreatment(clinic_id=clinic_id, **data.dict())
    db.add(db_treatment)
    db.commit()
    db.refresh(db_treatment)
    _enrich_patient_treatment(db, db_treatment)
    return db_treatment


def update_treatment(db: Session, treatment_id: int, clinic_id: int, data: PatientTreatmentUpdate):
    db_treatment = db.query(PatientTreatment).filter(
        PatientTreatment.id == treatment_id,
        PatientTreatment.clinic_id == clinic_id,
    ).first()
    if not db_treatment:
        return None
    for field, value in data.dict(exclude_unset=True).items():
        setattr(db_treatment, field, value)
    db.add(db_treatment)
    db.commit()
    db.refresh(db_treatment)
    _enrich_patient_treatment(db, db_treatment)
    return db_treatment


def delete_treatment(db: Session, treatment_id: int, clinic_id: int):
    db_treatment = db.query(PatientTreatment).filter(
        PatientTreatment.id == treatment_id,
        PatientTreatment.clinic_id == clinic_id,
    ).first()
    if not db_treatment:
        return False
    db.delete(db_treatment)
    db.commit()
    return True
