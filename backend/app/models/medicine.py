from sqlalchemy import Column, Integer, String, Text, ForeignKey
from app.db.base import CreatedOnlyModel


class Medicine(CreatedOnlyModel):
    __tablename__ = "medicine"
    id = Column(Integer, primary_key=True, autoincrement=True)
    clinic_id = Column(Integer, ForeignKey("clinic_data.clinic_id"), nullable=False)
    name = Column(String(200), nullable=False)
    quantity = Column(Integer, default=0)
    threshold_level = Column(Integer, default=10)
    notes = Column(Text)
