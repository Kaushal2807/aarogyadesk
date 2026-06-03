from sqlalchemy import Column, Integer, String, Text, ForeignKey, Index
from app.db.base import CreatedOnlyModel


class PatientTreatment(CreatedOnlyModel):
    __tablename__ = "patient_treatments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    clinic_id = Column(Integer, ForeignKey("clinic_data.clinic_id"), nullable=False, index=True)
    patient_uid = Column(String(50), nullable=False, index=True)
    patient_name = Column(String(200), nullable=False)
    tooth_upper_right = Column(String(50))
    tooth_upper_left = Column(String(50))
    tooth_lower_right = Column(String(50))
    tooth_lower_left = Column(String(50))
    diagnosis_id = Column(Integer, ForeignKey("treatment_plan.id"))
    treatment_id = Column(Integer, ForeignKey("treatment_plan.id"))
    estimates = Column(String(200))
    remarks = Column(Text)

    # Composite index: always queried as clinic + patient together
    __table_args__ = (
        Index("ix_patient_treatments_clinic_uid", "clinic_id", "patient_uid"),
    )
