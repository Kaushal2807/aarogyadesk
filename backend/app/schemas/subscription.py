from pydantic import BaseModel
from typing import Optional, Literal
from datetime import date, datetime
from decimal import Decimal


class SubscriptionCreate(BaseModel):
    clinic_id: int
    plan_type: Literal["1 Month", "6 Months", "1 Year"]
    plan_amount: float
    payment_status: Literal["Paid", "Pending", "Partial"] = "Paid"
    payment_method: Optional[Literal["Cash", "UPI", "Cheque"]] = None
    transaction_reference: Optional[str] = None
    received_by: Optional[str] = None
    start_date: date
    end_date: date
    notes: Optional[str] = None


class SubscriptionRenew(BaseModel):
    plan_type: Literal["1 Month", "6 Months", "1 Year"]
    plan_amount: float
    payment_status: Literal["Paid", "Pending", "Partial"]
    payment_method: Optional[Literal["Cash", "UPI", "Cheque"]] = None
    transaction_reference: Optional[str] = None
    received_by: Optional[str] = None


class SubscriptionResponse(BaseModel):
    subscription_id: int
    clinic_id: int
    plan_type: Optional[str] = None
    plan_amount: Optional[float] = None
    payment_status: str = "Paid"
    payment_method: Optional[str] = None
    transaction_reference: Optional[str] = None
    received_by: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_decimal(cls, obj):
        """Convert Decimal fields to float for JSON serialization."""
        data = {
            "subscription_id": obj.subscription_id,
            "clinic_id": obj.clinic_id,
            "plan_type": obj.plan_type,
            "plan_amount": float(obj.plan_amount) if isinstance(obj.plan_amount, Decimal) else obj.plan_amount,
            "payment_status": obj.payment_status,
            "payment_method": obj.payment_method,
            "transaction_reference": obj.transaction_reference,
            "received_by": obj.received_by,
            "start_date": obj.start_date,
            "end_date": obj.end_date,
            "notes": obj.notes,
            "created_at": obj.created_at,
        }
        return cls(**data)
