from sqlalchemy import Column, Integer, String, Text, ForeignKey
from app.db.base import CreatedOnlyModel


class MasterDiagnosis(CreatedOnlyModel):
    __tablename__ = "master_diagnosis"
    id = Column(Integer, primary_key=True, autoincrement=True)
    clinic_id = Column(Integer, ForeignKey("clinic_data.clinic_id"), nullable=False, index=True)
    diagnosis_name = Column(String(300), nullable=False)
    description = Column(Text)


class MasterTreatmentPlan(CreatedOnlyModel):
    __tablename__ = "master_treatment_option"
    id = Column(Integer, primary_key=True, autoincrement=True)
    clinic_id = Column(Integer, ForeignKey("clinic_data.clinic_id"), nullable=False, index=True)
    treatment_name = Column(String(300), nullable=False)
    description = Column(Text)
