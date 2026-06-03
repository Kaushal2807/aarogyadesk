from sqlalchemy import Column, Integer, String, Text, Date, Numeric, ForeignKey, Enum
from app.db.base import CreatedOnlyModel


class ClinicSubscription(CreatedOnlyModel):
    __tablename__ = "clinic_subscriptions"
    subscription_id = Column(Integer, primary_key=True, autoincrement=True)
    clinic_id = Column(Integer, ForeignKey("clinic_data.clinic_id"), nullable=False, index=True)
    plan_type = Column(Enum("1 Month", "6 Months", "1 Year", name="plan_type_enum"))
    plan_amount = Column(Numeric(10, 2))
    payment_status = Column(Enum("Paid", "Pending", "Partial", name="sub_payment_status_enum"), default="Paid")
    payment_method = Column(Enum("Cash", "UPI", "Cheque", name="sub_payment_method_enum"))
    transaction_reference = Column(String(200))
    received_by = Column(String(200))
    start_date = Column(Date)
    end_date = Column(Date)
    notes = Column(Text)
