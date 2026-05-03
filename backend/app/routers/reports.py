from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.deps import get_clinic_id
from app.services.report_service import get_kpi, get_patient_trend, get_expense_comparison

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/kpi")
async def kpi(db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    return get_kpi(db, clinic_id)


@router.get("/patient-trend")
async def patient_trend(db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    return get_patient_trend(db, clinic_id)


@router.get("/expense-comparison")
async def expense_comparison(db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    return get_expense_comparison(db, clinic_id)
