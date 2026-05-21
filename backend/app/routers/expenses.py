from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.deps import get_clinic_id
from app.schemas.expense import (
    ExpenseCategoryCreate, ExpenseCategoryUpdate, ExpenseCategoryResponse,
    ExpenseCreate, ExpenseUpdate, ExpenseResponse,
)
from app.services.expense_service import (
    get_categories, create_category, update_category, delete_category,
    get_expenses, create_expense, update_expense, delete_expense, get_expense_summary,
)

router = APIRouter(prefix="/api", tags=["expenses"])


@router.get("/expense-categories", response_model=list[ExpenseCategoryResponse])
async def list_categories(db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    return get_categories(db, clinic_id)


@router.post("/expense-categories", response_model=ExpenseCategoryResponse, status_code=status.HTTP_201_CREATED)
async def add_category(data: ExpenseCategoryCreate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    return create_category(db, clinic_id, data)


@router.put("/expense-categories/{category_id}", response_model=ExpenseCategoryResponse)
async def edit_category(category_id: int, data: ExpenseCategoryUpdate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    result = update_category(db, clinic_id, category_id, data)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return result


@router.delete("/expense-categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_category(category_id: int, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    if not delete_category(db, clinic_id, category_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")


@router.get("/expenses", response_model=list[ExpenseResponse])
async def list_expenses(
    month: int = Query(None), year: int = Query(None), category_id: int = Query(None),
    skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id),
):
    return get_expenses(db, clinic_id, month=month, year=year, category_id=category_id, skip=skip, limit=limit)


@router.get("/expenses/summary")
async def expense_summary(db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    return get_expense_summary(db, clinic_id)


@router.post("/expenses", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
async def add_expense(data: ExpenseCreate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    return create_expense(db, clinic_id, data)


@router.put("/expenses/{expense_id}", response_model=ExpenseResponse)
async def edit_expense(expense_id: int, data: ExpenseUpdate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    result = update_expense(db, clinic_id, expense_id, data)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
    return result


@router.delete("/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_expense(expense_id: int, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    if not delete_expense(db, clinic_id, expense_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
