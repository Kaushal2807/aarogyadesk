from pydantic import BaseModel
from typing import Optional, Literal
from datetime import date, datetime
from decimal import Decimal


class ExpenseCategoryCreate(BaseModel):
    category_name: str


class ExpenseCategoryUpdate(BaseModel):
    category_name: str


class ExpenseCategoryResponse(BaseModel):
    id: int
    clinic_id: int
    category_name: str
    created_at: datetime

    class Config:
        from_attributes = True


class ExpenseCreate(BaseModel):
    category_id: Optional[int] = None
    expense_month: int
    expense_year: int
    title: str
    description: Optional[str] = None
    amount: float
    payment_mode: Literal["Cash", "UPI"] = "Cash"
    expense_date: Optional[date] = None


class ExpenseUpdate(BaseModel):
    category_id: Optional[int] = None
    expense_month: Optional[int] = None
    expense_year: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    payment_mode: Optional[Literal["Cash", "UPI"]] = None
    expense_date: Optional[date] = None


class ExpenseResponse(BaseModel):
    id: int
    clinic_id: int
    category_id: Optional[int] = None
    expense_month: Optional[int] = None
    expense_year: Optional[int] = None
    title: str
    description: Optional[str] = None
    amount: float
    payment_mode: str = "Cash"
    expense_date: Optional[date] = None
    created_at: datetime

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_decimal(cls, obj):
        """Convert Decimal fields to float for JSON serialization."""
        data = {
            "id": obj.id,
            "clinic_id": obj.clinic_id,
            "category_id": obj.category_id,
            "expense_month": obj.expense_month,
            "expense_year": obj.expense_year,
            "title": obj.title,
            "description": obj.description,
            "amount": float(obj.amount) if isinstance(obj.amount, Decimal) else obj.amount,
            "payment_mode": obj.payment_mode,
            "expense_date": obj.expense_date,
            "created_at": obj.created_at,
        }
        return cls(**data)


class ExpenseSummaryResponse(BaseModel):
    total_amount: float
    month: int
    year: int
    cash_total: float = 0.0
    upi_total: float = 0.0
