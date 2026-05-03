from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey, Enum
from app.db.base import CreatedOnlyModel


class Appointment(CreatedOnlyModel):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    clinic_id = Column(Integer, ForeignKey("clinic_data.clinic_id"), nullable=False)
    patient_name = Column(String(200), nullable=False)
    age = Column(Integer)
    contact_number = Column(String(20))
    address = Column(Text)
    appointment_date = Column(Date, nullable=False)
    appointment_time = Column(String(10), nullable=False)
    booking_type = Column(Enum("call", "walk-in", name="booking_type_enum"), default="walk-in")
    status = Column(Enum("pending", "completed", name="appointment_status_enum"), default="pending")
