from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.treatment_plan import TreatmentPlan
from app.models.patient_treatment import PatientTreatment
from app.models.master_treatment import MasterDiagnosis, MasterTreatmentPlan
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
    items = (
        db.query(PatientTreatment)
        .filter(PatientTreatment.clinic_id == clinic_id)
        .order_by(PatientTreatment.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    # enrich each item with readable names
    for it in items:
        _enrich_patient_treatment(db, it)
    return items


def get_treatments_by_patient(db: Session, clinic_id: int, patient_uid: str):
    items = (
        db.query(PatientTreatment)
        .filter(
            PatientTreatment.clinic_id == clinic_id,
            PatientTreatment.patient_uid == patient_uid,
        )
        .order_by(PatientTreatment.created_at.desc())
        .all()
    )
    for it in items:
        _enrich_patient_treatment(db, it)
    return items


def _enrich_patient_treatment(db: Session, treatment: PatientTreatment):
    """Attach diagnosis and treatment names onto a PatientTreatment object."""
    # Try to resolve diagnosis: first check TreatmentPlan, then MasterDiagnosis
    if treatment.diagnosis_id:
        plan = db.query(TreatmentPlan).filter(TreatmentPlan.id == treatment.diagnosis_id).first()
        if plan:
            treatment.diagnosis = plan.diagnosis
        else:
            md = db.query(MasterDiagnosis).filter(MasterDiagnosis.id == treatment.diagnosis_id).first()
            treatment.diagnosis = md.diagnosis_name if md else None
    # Try to resolve treatment: first check TreatmentPlan, then MasterTreatmentPlan
    if treatment.treatment_id:
        plan = db.query(TreatmentPlan).filter(TreatmentPlan.id == treatment.treatment_id).first()
        if plan:
            treatment.treatment = plan.treatment
        else:
            mt = db.query(MasterTreatmentPlan).filter(MasterTreatmentPlan.id == treatment.treatment_id).first()
            treatment.treatment = mt.treatment_name if mt else None
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
    # Prepare payload and handle master-table ids that don't exist in treatment_plan
    payload = data.dict()

    diag_id = payload.get('diagnosis_id')
    treat_id = payload.get('treatment_id')

    # Check if provided ids reference existing TreatmentPlan rows
    valid_diag_plan = None
    valid_treat_plan = None
    if diag_id:
        valid_diag_plan = db.query(TreatmentPlan).filter(TreatmentPlan.id == diag_id, TreatmentPlan.clinic_id == clinic_id).first()
    if treat_id:
        valid_treat_plan = db.query(TreatmentPlan).filter(TreatmentPlan.id == treat_id, TreatmentPlan.clinic_id == clinic_id).first()

    # If either id is not a valid treatment_plan id, see if they are master ids and create a treatment_plan entry
    if (diag_id and not valid_diag_plan) or (treat_id and not valid_treat_plan):
        md = None
        mt = None
        if diag_id and not valid_diag_plan:
            md = db.query(MasterDiagnosis).filter(MasterDiagnosis.id == diag_id, MasterDiagnosis.clinic_id == clinic_id).first()
        if treat_id and not valid_treat_plan:
            mt = db.query(MasterTreatmentPlan).filter(MasterTreatmentPlan.id == treat_id, MasterTreatmentPlan.clinic_id == clinic_id).first()

        if md or mt:
            diag_text = md.diagnosis_name if md else (valid_diag_plan.diagnosis if valid_diag_plan else '')
            treat_text = mt.treatment_name if mt else (valid_treat_plan.treatment if valid_treat_plan else '')
            # create a treatment_plan record to satisfy FK
            # try to reuse an existing treatment_plan with same texts to avoid duplicates
            existing = db.query(TreatmentPlan).filter(
                TreatmentPlan.clinic_id == clinic_id,
                TreatmentPlan.diagnosis == (diag_text or ''),
                TreatmentPlan.treatment == (treat_text or ''),
            ).first()
            if existing:
                new_id = existing.id
            else:
                new_plan = TreatmentPlan(clinic_id=clinic_id, diagnosis=diag_text or '', treatment=treat_text or '')
                db.add(new_plan)
                db.flush()
                new_id = new_plan.id
            payload['diagnosis_id'] = new_id
            payload['treatment_id'] = new_id

    db_treatment = PatientTreatment(clinic_id=clinic_id, **payload)
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
