from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey, Index
from app.db.base import CreatedOnlyModel


class WorkDone(CreatedOnlyModel):
    __tablename__ = "work_done"
    id = Column(Integer, primary_key=True, autoincrement=True)
    clinic_id = Column(Integer, ForeignKey("clinic_data.clinic_id"), nullable=False, index=True)
    work_name = Column(String(200), nullable=False)


class PatientWorkDone(CreatedOnlyModel):
    __tablename__ = "patient_work_done"
    id = Column(Integer, primary_key=True, autoincrement=True)
    clinic_id = Column(Integer, ForeignKey("clinic_data.clinic_id"), nullable=False, index=True)
    patient_uid = Column(String(50), nullable=False, index=True)
    patient_name = Column(String(200), nullable=False)
    work_done_id = Column(Integer, ForeignKey("work_done.id"))
    description = Column(Text)
    work_date = Column(Date)

    # Composite index: always filtered by clinic + patient
    __table_args__ = (
        Index("ix_patient_work_done_clinic_uid", "clinic_id", "patient_uid"),
    )
