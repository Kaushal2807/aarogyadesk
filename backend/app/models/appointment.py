from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey, Enum, Index
from app.db.base import CreatedOnlyModel


class Appointment(CreatedOnlyModel):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    clinic_id = Column(Integer, ForeignKey("clinic_data.clinic_id"), nullable=False, index=True)
    patient_name = Column(String(200), nullable=False)
    age = Column(Integer)
    contact_number = Column(String(20))
    address = Column(Text)
    appointment_date = Column(Date, nullable=False, index=True)
    appointment_time = Column(String(10), nullable=False)
    booking_type = Column(Enum("call", "walk-in", name="booking_type_enum"), default="walk-in")
    status = Column(Enum("pending", "completed", name="appointment_status_enum"), default="pending")

    # Composite index for the primary filter: clinic + date
    __table_args__ = (
        Index("ix_appointments_clinic_date", "clinic_id", "appointment_date"),
    )

