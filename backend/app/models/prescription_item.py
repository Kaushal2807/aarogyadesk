from sqlalchemy import Column, Integer, Text, ForeignKey
from app.db.base import CreatedOnlyModel


class PrescriptionItem(CreatedOnlyModel):
    __tablename__ = "prescription_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    # Index on prescription_id: fetching all items for a prescription is the
    # primary access pattern — without this it's a full table scan per prescription.
    prescription_id = Column(Integer, ForeignKey("prescriptions.id"), nullable=False, index=True)
    clinic_id = Column(Integer, ForeignKey("clinic_data.clinic_id"), nullable=False, index=True)
    drug_id = Column(Integer, ForeignKey("master_medicine.id"), index=True)
    dose_id = Column(Integer, ForeignKey("master_dose.id"))
    frequency_id = Column(Integer, ForeignKey("master_frequency.id"))
    duration_id = Column(Integer, ForeignKey("master_duration.id"))
    quantity_id = Column(Integer, ForeignKey("master_quantity.id"))
    instruction = Column(Text)

