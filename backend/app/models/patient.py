from sqlalchemy import Column, Integer, String, Text, Date, Numeric, ForeignKey, Enum
from app.db.base import CreatedOnlyModel


class Patient(CreatedOnlyModel):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, autoincrement=True)
    clinic_id = Column(Integer, ForeignKey("clinic_data.clinic_id"), nullable=False)
    patient_uid = Column(String(50), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    age = Column(Integer)
    contact_number = Column(String(20))
    address = Column(Text)
    date_of_visit = Column(Date)
    total_visit = Column(Integer, default=1)
    notes = Column(Text)
    total_amount = Column(Numeric(10, 2), default=0)
    payment_status = Column(Enum("paid", "partial", "pending", name="payment_status_enum"), default="pending")
    payment_pending = Column(Numeric(10, 2), default=0)
    chief_complain = Column(Text)
    medical_history = Column(Text)
    oral_diet_habit = Column(Text)
    family_history = Column(Text)
    xray_remark = Column(Text)
