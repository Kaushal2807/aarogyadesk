from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Numeric, extract
from decimal import Decimal
from app.models.patient import Patient
from app.models.expense import Expense


def get_kpi(db: Session, clinic_id: int):
    """Get key performance indicators for a clinic."""
    total = (
        db.query(func.count(Patient.id))
        .filter(Patient.clinic_id == clinic_id)
        .scalar()
        or 0
    )
    paid = (
        db.query(func.count(Patient.id))
        .filter(Patient.clinic_id == clinic_id, Patient.payment_status == "paid")
        .scalar()
        or 0
    )
    partial = (
        db.query(func.count(Patient.id))
        .filter(Patient.clinic_id == clinic_id, Patient.payment_status == "partial")
        .scalar()
        or 0
    )
    pending = (
        db.query(func.count(Patient.id))
        .filter(Patient.clinic_id == clinic_id, Patient.payment_status == "pending")
        .scalar()
        or 0
    )
    today = (
        db.query(func.count(Patient.id))
        .filter(
            Patient.clinic_id == clinic_id,
            func.date(Patient.date_of_visit) == datetime.utcnow().date(),
        )
        .scalar()
        or 0
    )
    return {
        "total_patients": total,
        "paid": paid,
        "partial": partial,
        "pending": pending,
        "today_patients": today,
    }


def get_patient_trend(db: Session, clinic_id: int):
    """Get monthly patient counts for the last 6 months."""
    six_months_ago = datetime.utcnow() - timedelta(days=180)
    rows = (
        db.query(
            func.date_trunc("month", Patient.created_at).label("month"),
            func.count(Patient.id).label("patients"),
        )
        .filter(Patient.clinic_id == clinic_id, Patient.created_at >= six_months_ago)
        .group_by(func.date_trunc("month", Patient.created_at))
        .order_by(func.date_trunc("month", Patient.created_at))
        .all()
    )
    return [
        {"month": row.month.strftime("%Y-%m"), "patients": row.patients}
        for row in rows
    ]


def get_expense_comparison(db: Session, clinic_id: int):
    """Get monthly expense totals for the last 6 months."""
    six_months_ago = datetime.utcnow() - timedelta(days=180)
    rows = (
        db.query(
            func.date_trunc("month", Expense.created_at).label("month"),
            func.sum(cast(Expense.amount, Numeric)).label("expenses"),
        )
        .filter(Expense.clinic_id == clinic_id, Expense.created_at >= six_months_ago)
        .group_by(func.date_trunc("month", Expense.created_at))
        .order_by(func.date_trunc("month", Expense.created_at))
        .all()
    )
    return [
        {
            "month": row.month.strftime("%Y-%m"),
            "expenses": float(row.expenses) if row.expenses else 0.0,
        }
        for row in rows
    ]
