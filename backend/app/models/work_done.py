from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey
from app.db.base import CreatedOnlyModel


class WorkDone(CreatedOnlyModel):
    __tablename__ = "work_done"
    id = Column(Integer, primary_key=True, autoincrement=True)
    clinic_id = Column(Integer, ForeignKey("clinic_data.clinic_id"), nullable=False)
    work_name = Column(String(200), nullable=False)


class PatientWorkDone(CreatedOnlyModel):
    __tablename__ = "patient_work_done"
    id = Column(Integer, primary_key=True, autoincrement=True)
    clinic_id = Column(Integer, ForeignKey("clinic_data.clinic_id"), nullable=False)
    patient_uid = Column(String(50), nullable=False)
    patient_name = Column(String(200), nullable=False)
    work_done_id = Column(Integer, ForeignKey("work_done.id"))
    description = Column(Text)
    work_date = Column(Date)
