from sqlalchemy.orm import Session
from app.models.work_done import WorkDone, PatientWorkDone
from app.schemas.work_done import WorkDoneCreate, WorkDoneUpdate, PatientWorkDoneCreate, PatientWorkDoneUpdate


# ── Work Done Types ──

def get_work_done_types(db: Session, clinic_id: int, skip: int = 0, limit: int = 100):
    return (
        db.query(WorkDone)
        .filter(WorkDone.clinic_id == clinic_id)
        .order_by(WorkDone.work_name)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_work_done_type(db: Session, clinic_id: int, work_id: int):
    return (
        db.query(WorkDone)
        .filter(WorkDone.clinic_id == clinic_id, WorkDone.id == work_id)
        .first()
    )


def create_work_done_type(db: Session, clinic_id: int, data: WorkDoneCreate):
    work = WorkDone(clinic_id=clinic_id, work_name=data.work_name)
    db.add(work)
    db.commit()
    db.refresh(work)
    return work


def update_work_done_type(db: Session, clinic_id: int, work_id: int, data: WorkDoneUpdate):
    work = get_work_done_type(db, clinic_id, work_id)
    if not work:
        return None
    work.work_name = data.work_name
    db.add(work)
    db.commit()
    db.refresh(work)
    return work


def delete_work_done_type(db: Session, clinic_id: int, work_id: int):
    work = get_work_done_type(db, clinic_id, work_id)
    if not work:
        return False
    db.delete(work)
    db.commit()
    return True


# ── Patient Work Done ──

def get_patient_work_done(db: Session, clinic_id: int, skip: int = 0, limit: int = 100):
    return (
        db.query(PatientWorkDone)
        .filter(PatientWorkDone.clinic_id == clinic_id)
        .order_by(PatientWorkDone.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_patient_work_done_by_uid(db: Session, clinic_id: int, patient_uid: str):
    return (
        db.query(PatientWorkDone)
        .filter(
            PatientWorkDone.clinic_id == clinic_id,
            PatientWorkDone.patient_uid == patient_uid,
        )
        .order_by(PatientWorkDone.work_date.desc())
        .all()
    )


def get_single_patient_work_done(db: Session, clinic_id: int, work_id: int):
    return (
        db.query(PatientWorkDone)
        .filter(PatientWorkDone.clinic_id == clinic_id, PatientWorkDone.id == work_id)
        .first()
    )


def create_patient_work_done(db: Session, clinic_id: int, data: PatientWorkDoneCreate):
    work = PatientWorkDone(clinic_id=clinic_id, **data.model_dump())
    db.add(work)
    db.commit()
    db.refresh(work)
    return work


def update_patient_work_done(db: Session, clinic_id: int, work_id: int, data: PatientWorkDoneUpdate):
    work = get_single_patient_work_done(db, clinic_id, work_id)
    if not work:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(work, field, value)
    db.add(work)
    db.commit()
    db.refresh(work)
    return work


def delete_patient_work_done(db: Session, clinic_id: int, work_id: int):
    work = get_single_patient_work_done(db, clinic_id, work_id)
    if not work:
        return False
    db.delete(work)
    db.commit()
    return True
