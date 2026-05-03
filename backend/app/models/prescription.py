from sqlalchemy import Column, Integer, String, Date, ForeignKey
from app.db.base import CreatedOnlyModel


class Prescription(CreatedOnlyModel):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    clinic_id = Column(Integer, ForeignKey("clinic_data.clinic_id"), nullable=False)
    patient_uid = Column(String(50), nullable=False)
    patient_name = Column(String(200), nullable=False)
    prescription_date = Column(Date, nullable=False)
