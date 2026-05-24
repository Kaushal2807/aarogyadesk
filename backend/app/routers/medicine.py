from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.deps import get_clinic_id
from app.schemas.medicine import MedicineCreate, MedicineUpdate, MedicineResponse
from app.services.medicine_service import get_medicines, get_low_stock, create_medicine, update_medicine, delete_medicine

router = APIRouter(prefix="/api/medicine", tags=["medicine"])


@router.get("", response_model=list[MedicineResponse])
def list_medicine(search: str = Query(None), db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    return get_medicines(db, clinic_id, search=search)


@router.get("/low-stock", response_model=list[MedicineResponse])
def low_stock(db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    return get_low_stock(db, clinic_id)


@router.post("", response_model=MedicineResponse, status_code=status.HTTP_201_CREATED)
def add_medicine(data: MedicineCreate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    return create_medicine(db, clinic_id, data)


@router.put("/{medicine_id}", response_model=MedicineResponse)
def edit_medicine(medicine_id: int, data: MedicineUpdate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    result = update_medicine(db, clinic_id, medicine_id, data)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medicine not found")
    return result


@router.delete("/{medicine_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_medicine(medicine_id: int, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    if not delete_medicine(db, medicine_id, clinic_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medicine not found")
