from sqlalchemy import Column, Integer, String, Text, Date, Numeric, ForeignKey, Enum
from app.db.base import CreatedOnlyModel


class ExpenseCategory(CreatedOnlyModel):
    __tablename__ = "expense_categories"
    id = Column(Integer, primary_key=True, autoincrement=True)
    clinic_id = Column(Integer, ForeignKey("clinic_data.clinic_id"), nullable=False)
    category_name = Column(String(200), nullable=False)


class Expense(CreatedOnlyModel):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, autoincrement=True)
    clinic_id = Column(Integer, ForeignKey("clinic_data.clinic_id"), nullable=False)
    category_id = Column(Integer, ForeignKey("expense_categories.id"))
    expense_month = Column(Integer)
    expense_year = Column(Integer)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    amount = Column(Numeric(10, 2), nullable=False)
    payment_mode = Column(Enum("Cash", "UPI", name="expense_payment_mode_enum"), default="Cash")
    expense_date = Column(Date)
