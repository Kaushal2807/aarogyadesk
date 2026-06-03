from sqlalchemy import Column, Integer, String, Text, Date, Numeric, ForeignKey, Enum, Index
from app.db.base import CreatedOnlyModel


class ExpenseCategory(CreatedOnlyModel):
    __tablename__ = "expense_categories"
    id = Column(Integer, primary_key=True, autoincrement=True)
    clinic_id = Column(Integer, ForeignKey("clinic_data.clinic_id"), nullable=False, index=True)
    category_name = Column(String(200), nullable=False)


class Expense(CreatedOnlyModel):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, autoincrement=True)
    clinic_id = Column(Integer, ForeignKey("clinic_data.clinic_id"), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("expense_categories.id"), index=True)
    expense_month = Column(Integer)
    expense_year = Column(Integer)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    amount = Column(Numeric(10, 2), nullable=False)
    payment_mode = Column(Enum("Cash", "UPI", "Cheque", name="expense_payment_mode_enum"), default="Cash")
    expense_date = Column(Date)

    # Composite index: all expense queries filter by clinic + year + month
    __table_args__ = (
        Index("ix_expenses_clinic_year_month", "clinic_id", "expense_year", "expense_month"),
    )
