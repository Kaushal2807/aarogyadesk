from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from app.db.base import CreatedOnlyModel


class UserQuery(CreatedOnlyModel):
    __tablename__ = "user_query"
    id = Column(Integer, primary_key=True, autoincrement=True)
    clinic_id = Column(Integer, ForeignKey("clinic_data.clinic_id"), nullable=False)
    clinic_name = Column(String(200))
    person_name = Column(String(200), nullable=False)
    email = Column(String(100))
    phone = Column(String(20))
    subject = Column(String(500), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(Integer, default=0)
    resolved_at = Column(DateTime)
