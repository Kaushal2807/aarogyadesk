from sqlalchemy import Column, Integer, Text, ForeignKey
from app.db.base import CreatedOnlyModel


class TreatmentPlan(CreatedOnlyModel):
    __tablename__ = "treatment_plan"

    id = Column(Integer, primary_key=True, autoincrement=True)
    clinic_id = Column(Integer, ForeignKey("clinic_data.clinic_id"), nullable=False)
    diagnosis = Column(Text, nullable=False)
    treatment = Column(Text, nullable=False)
