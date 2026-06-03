from sqlalchemy import Column, Integer, String, Date, ForeignKey, Index
from app.db.base import CreatedOnlyModel


class Prescription(CreatedOnlyModel):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    clinic_id = Column(Integer, ForeignKey("clinic_data.clinic_id"), nullable=False, index=True)
    patient_uid = Column(String(50), nullable=False, index=True)
    patient_name = Column(String(200), nullable=False)
    prescription_date = Column(Date, nullable=False)

    # Composite index: the most common query pattern is always clinic + patient
    __table_args__ = (
        Index("ix_prescriptions_clinic_patient", "clinic_id", "patient_uid"),
    )

