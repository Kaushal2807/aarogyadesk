from sqlalchemy import Column, Integer, String, ForeignKey
from app.db.base import BaseModel


class ClinicDoctor(BaseModel):
    __tablename__ = "clinic_doctors"
    id = Column(Integer, primary_key=True, autoincrement=True)
    clinic_id = Column(Integer, ForeignKey("clinic_data.clinic_id"), nullable=False)
    doctor_name = Column(String(200), nullable=False)
    doctor_position = Column(String(200))
