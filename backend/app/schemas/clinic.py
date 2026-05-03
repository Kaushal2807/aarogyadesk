from pydantic import BaseModel
from typing import Optional, Literal
from datetime import date, datetime


class ClinicCreate(BaseModel):
    clinic_name: str
    clinic_code: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    logo: Optional[str] = None
    status: Literal["Active", "Inactive"] = "Active"


class ClinicUpdate(BaseModel):
    clinic_name: Optional[str] = None
    clinic_code: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    logo: Optional[str] = None
    status: Optional[Literal["Active", "Inactive"]] = None
    current_subscription_end: Optional[date] = None


class ClinicResponse(BaseModel):
    clinic_id: int
    clinic_name: str
    clinic_code: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    logo: Optional[str] = None
    status: str = "Active"
    current_subscription_end: Optional[date] = None
    created_at: datetime

    class Config:
        from_attributes = True
