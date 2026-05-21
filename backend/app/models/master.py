from sqlalchemy import Column, Integer, String, ForeignKey
from app.db.base import CreatedOnlyModel


class MasterMedicine(CreatedOnlyModel):
    __tablename__ = "master_medicine"
    id = Column(Integer, primary_key=True, autoincrement=True)
    clinic_id = Column(Integer, ForeignKey("clinic_data.clinic_id", ondelete="CASCADE"), nullable=True)
    name = Column(String(200), nullable=False)


class MasterDose(CreatedOnlyModel):
    __tablename__ = "master_dose"
    id = Column(Integer, primary_key=True, autoincrement=True)
    clinic_id = Column(Integer, ForeignKey("clinic_data.clinic_id", ondelete="CASCADE"), nullable=True)
    name = Column(String(100), nullable=False)


class MasterFrequency(CreatedOnlyModel):
    __tablename__ = "master_frequency"
    id = Column(Integer, primary_key=True, autoincrement=True)
    clinic_id = Column(Integer, ForeignKey("clinic_data.clinic_id", ondelete="CASCADE"), nullable=True)
    name = Column(String(100), nullable=False)


class MasterDuration(CreatedOnlyModel):
    __tablename__ = "master_duration"
    id = Column(Integer, primary_key=True, autoincrement=True)
    clinic_id = Column(Integer, ForeignKey("clinic_data.clinic_id", ondelete="CASCADE"), nullable=True)
    name = Column(String(100), nullable=False)


class MasterQuantity(CreatedOnlyModel):
    __tablename__ = "master_quantity"
    id = Column(Integer, primary_key=True, autoincrement=True)
    clinic_id = Column(Integer, ForeignKey("clinic_data.clinic_id", ondelete="CASCADE"), nullable=True)
    name = Column(String(100), nullable=False)


class MasterNotes(CreatedOnlyModel):
    __tablename__ = "master_notes"
    id = Column(Integer, primary_key=True, autoincrement=True)
    clinic_id = Column(Integer, ForeignKey("clinic_data.clinic_id", ondelete="CASCADE"), nullable=True)
    name = Column(String(200), nullable=False)
