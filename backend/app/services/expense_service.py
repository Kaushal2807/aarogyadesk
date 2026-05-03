from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Numeric
from app.models.expense import ExpenseCategory, Expense
from app.schemas.expense import ExpenseCategoryCreate, ExpenseCategoryUpdate, ExpenseCreate, ExpenseUpdate


# ── Expense Categories ──

def get_categories(db: Session, clinic_id: int, skip: int = 0, limit: int = 100):
    return (
        db.query(ExpenseCategory)
        .filter(ExpenseCategory.clinic_id == clinic_id)
        .order_by(ExpenseCategory.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_category(db: Session, clinic_id: int, category_id: int):
    return (
        db.query(ExpenseCategory)
        .filter(ExpenseCategory.clinic_id == clinic_id, ExpenseCategory.id == category_id)
        .first()
    )


def create_category(db: Session, clinic_id: int, data: ExpenseCategoryCreate):
    category = ExpenseCategory(clinic_id=clinic_id, category_name=data.category_name)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def update_category(db: Session, clinic_id: int, category_id: int, data: ExpenseCategoryUpdate):
    category = get_category(db, clinic_id, category_id)
    if not category:
        return None
    category.category_name = data.category_name
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def delete_category(db: Session, clinic_id: int, category_id: int):
    category = get_category(db, clinic_id, category_id)
    if not category:
        return False
    db.delete(category)
    db.commit()
    return True


# ── Expenses ──

def get_expenses(
    db: Session,
    clinic_id: int,
    skip: int = 0,
    limit: int = 100,
    month: int = None,
    year: int = None,
    category_id: int = None,
):
    query = db.query(Expense).filter(Expense.clinic_id == clinic_id)
    if month is not None:
        query = query.filter(Expense.expense_month == month)
    if year is not None:
        query = query.filter(Expense.expense_year == year)
    if category_id is not None:
        query = query.filter(Expense.category_id == category_id)
    return query.order_by(Expense.created_at.desc()).offset(skip).limit(limit).all()


def get_expense(db: Session, clinic_id: int, expense_id: int):
    return (
        db.query(Expense)
        .filter(Expense.clinic_id == clinic_id, Expense.id == expense_id)
        .first()
    )


def create_expense(db: Session, clinic_id: int, data: ExpenseCreate):
    expense = Expense(clinic_id=clinic_id, **data.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


def update_expense(db: Session, clinic_id: int, expense_id: int, data: ExpenseUpdate):
    expense = get_expense(db, clinic_id, expense_id)
    if not expense:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(expense, field, value)
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


def delete_expense(db: Session, clinic_id: int, expense_id: int):
    expense = get_expense(db, clinic_id, expense_id)
    if not expense:
        return False
    db.delete(expense)
    db.commit()
    return True


# ── Summary ──

def get_expense_summary(db: Session, clinic_id: int):
    """Return monthly totals with cash/UPI breakdown for all months."""
    rows = (
        db.query(
            Expense.expense_month,
            Expense.expense_year,
            Expense.payment_mode,
            func.sum(cast(Expense.amount, Numeric)).label("total"),
        )
        .filter(Expense.clinic_id == clinic_id)
        .group_by(Expense.expense_month, Expense.expense_year, Expense.payment_mode)
        .all()
    )

    summary = {}
    for row in rows:
        key = (row.expense_month, row.expense_year)
        total = float(row.total) if row.total else 0.0
        if key not in summary:
            summary[key] = {
                "total_amount": 0.0,
                "cash_total": 0.0,
                "upi_total": 0.0,
                "month": row.expense_month,
                "year": row.expense_year,
            }
        summary[key]["total_amount"] += total
        if row.payment_mode == "Cash":
            summary[key]["cash_total"] = total
        elif row.payment_mode == "UPI":
            summary[key]["upi_total"] = total

    return sorted(summary.values(), key=lambda x: (x["year"], x["month"]))
