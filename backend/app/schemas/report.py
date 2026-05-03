from pydantic import BaseModel
from typing import List


class KPIResponse(BaseModel):
    total_patients: int = 0
    paid: int = 0
    partial: int = 0
    pending: int = 0
    today_patients: int = 0


class PatientTrendResponse(BaseModel):
    month: str
    patients: int


class ExpenseComparisonResponse(BaseModel):
    month: str
    expenses: float
