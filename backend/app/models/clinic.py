from sqlalchemy import Column, Integer, String, Text, Date, Enum
from app.db.base import CreatedOnlyModel


class ClinicData(CreatedOnlyModel):
    __tablename__ = "clinic_data"

    clinic_id = Column(Integer, primary_key=True, autoincrement=True)
    clinic_name = Column(String(200), nullable=False)
    clinic_code = Column(String(20), unique=True, nullable=False)
    address = Column(Text)
    phone = Column(String(50))
    email = Column(String(100))
    logo = Column(String(500))
    status = Column(Enum("Active", "Inactive", name="clinic_status_enum"), default="Active")
    current_subscription_end = Column(Date)
