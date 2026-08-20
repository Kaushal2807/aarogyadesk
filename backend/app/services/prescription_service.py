from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.prescription import Prescription
from app.models.prescription_item import PrescriptionItem
from app.models.master import (
    MasterMedicine, MasterDose, MasterFrequency, MasterDuration, MasterQuantity,
)
from app.schemas.prescription import PrescriptionCreate


def get_prescriptions(db: Session, clinic_id: int, skip: int = 0, limit: int = 100):
    return (
        db.query(Prescription)
        .filter(Prescription.clinic_id == clinic_id)
        .order_by(Prescription.prescription_date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_prescriptions_by_patient(db: Session, clinic_id: int, patient_uid: str):
    prescriptions = (
        db.query(Prescription)
        .filter(
            Prescription.clinic_id == clinic_id,
            Prescription.patient_uid == patient_uid,
        )
        .order_by(Prescription.prescription_date.desc())
        .all()
    )
    # Enrich each prescription with joined master-table names for its items
    return [get_prescription_with_items(db, p.id) for p in prescriptions]


def _item_to_dict(item: PrescriptionItem) -> dict:
    """Convert a PrescriptionItem ORM object to a dict with master-table names."""
    return {
        "id": item.id,
        "prescription_id": item.prescription_id,
        "clinic_id": item.clinic_id,
        "drug_id": item.drug_id,
        "dose_id": item.dose_id,
        "frequency_id": item.frequency_id,
        "duration_id": item.duration_id,
        "quantity_id": item.quantity_id,
        "instruction": item.instruction,
        "drug_name": getattr(item, "drug_name", None),
        "dose_name": getattr(item, "dose_name", None),
        "frequency_name": getattr(item, "frequency_name", None),
        "duration_name": getattr(item, "duration_name", None),
        "quantity_name": getattr(item, "quantity_name", None),
        "created_at": item.created_at,
    }


def get_prescription_with_items(db: Session, prescription_id: int):
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        return None

    items = (
        db.query(PrescriptionItem)
        .outerjoin(MasterMedicine, PrescriptionItem.drug_id == MasterMedicine.id)
        .outerjoin(MasterDose, PrescriptionItem.dose_id == MasterDose.id)
        .outerjoin(MasterFrequency, PrescriptionItem.frequency_id == MasterFrequency.id)
        .outerjoin(MasterDuration, PrescriptionItem.duration_id == MasterDuration.id)
        .outerjoin(MasterQuantity, PrescriptionItem.quantity_id == MasterQuantity.id)
        .filter(PrescriptionItem.prescription_id == prescription_id)
        .add_columns(
            MasterMedicine.name.label("drug_name"),
            MasterDose.name.label("dose_name"),
            MasterFrequency.name.label("frequency_name"),
            MasterDuration.name.label("duration_name"),
            MasterQuantity.name.label("quantity_name"),
        )
        .all()
    )

    result = {
        "id": prescription.id,
        "clinic_id": prescription.clinic_id,
        "patient_uid": prescription.patient_uid,
        "patient_name": prescription.patient_name,
        "prescription_date": prescription.prescription_date,
        "created_at": prescription.created_at,
        "items": [_item_to_dict(row[0]) for row in items],
    }

    # Inject master-table names onto each item dict
    for row, item_dict in zip(items, result["items"]):
        item_dict["drug_name"] = row.drug_name
        item_dict["dose_name"] = row.dose_name
        item_dict["frequency_name"] = row.frequency_name
        item_dict["duration_name"] = row.duration_name
        item_dict["quantity_name"] = row.quantity_name

    return result


def create_prescription(db: Session, clinic_id: int, data: PrescriptionCreate):
    db_prescription = Prescription(
        clinic_id=clinic_id,
        patient_uid=data.patient_uid,
        patient_name=data.patient_name,
        prescription_date=data.prescription_date,
    )
    db.add(db_prescription)
    db.commit()
    db.refresh(db_prescription)

    for item_data in data.items:
        db_item = PrescriptionItem(
            prescription_id=db_prescription.id,
            clinic_id=clinic_id,
            drug_id=item_data.drug_id,
            dose_id=item_data.dose_id,
            frequency_id=item_data.frequency_id,
            duration_id=item_data.duration_id,
            quantity_id=item_data.quantity_id,
            instruction=item_data.instruction,
        )
        db.add(db_item)

    db.commit()
    db.refresh(db_prescription)

    # Return the full prescription with items
    return get_prescription_with_items(db, db_prescription.id)


def delete_prescription(db: Session, prescription_id: int):
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        return False

    # Delete all associated items first
    db.query(PrescriptionItem).filter(
        PrescriptionItem.prescription_id == prescription_id
    ).delete()

    db.delete(prescription)
    db.commit()
    return True
