from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.deps import get_clinic_id
from app.models.master import (
    MasterMedicine, MasterDose, MasterFrequency,
    MasterDuration, MasterQuantity, MasterNotes,
)
from app.schemas.master import MasterResponse, MasterCreate, MasterUpdate
from app.services.master_service import (
    get_all_medicines, get_all_doses, get_all_frequencies,
    get_all_durations, get_all_quantities, get_all_notes,
    create_medicine, update_medicine, delete_medicine,
    create_dose, update_dose, delete_dose,
    create_frequency, update_frequency, delete_frequency,
    create_duration, update_duration, delete_duration,
    create_quantity, update_quantity, delete_quantity,
    create_note, update_note, delete_note,
)

router = APIRouter(prefix="/api/master", tags=["master"])


@router.get("/medicines", response_model=list[MasterResponse])
async def list_medicines(
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    return get_all_medicines(db, clinic_id)


@router.get("/doses", response_model=list[MasterResponse])
async def list_doses(
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    return get_all_doses(db, clinic_id)


@router.get("/frequencies", response_model=list[MasterResponse])
async def list_frequencies(
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    return get_all_frequencies(db, clinic_id)


@router.get("/durations", response_model=list[MasterResponse])
async def list_durations(
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    return get_all_durations(db, clinic_id)


@router.get("/quantities", response_model=list[MasterResponse])
async def list_quantities(
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    return get_all_quantities(db, clinic_id)


@router.get("/notes", response_model=list[MasterResponse])
async def list_notes(
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    return get_all_notes(db, clinic_id)


# CRUD endpoints
@router.post("/medicines", response_model=MasterResponse, status_code=201)
async def create_master_medicine(
    payload: MasterCreate,
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    return create_medicine(db, clinic_id, payload.name)


@router.put("/medicines/{item_id}", response_model=MasterResponse)
async def update_master_medicine(
    item_id: int,
    payload: MasterUpdate,
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    item = update_medicine(db, clinic_id, item_id, payload.name)
    return item


@router.delete("/medicines/{item_id}", status_code=204)
async def delete_master_medicine(
    item_id: int,
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    if not delete_medicine(db, clinic_id, item_id):
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")


# Doses
@router.post("/doses", response_model=MasterResponse, status_code=201)
async def create_master_dose(payload: MasterCreate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    return create_dose(db, clinic_id, payload.name)


@router.put("/doses/{item_id}", response_model=MasterResponse)
async def update_master_dose(item_id: int, payload: MasterUpdate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    return update_dose(db, clinic_id, item_id, payload.name)


@router.delete("/doses/{item_id}", status_code=204)
async def delete_master_dose(item_id: int, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    if not delete_dose(db, clinic_id, item_id):
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")


# Frequencies
@router.post("/frequencies", response_model=MasterResponse, status_code=201)
async def create_master_frequency(payload: MasterCreate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    return create_frequency(db, clinic_id, payload.name)


@router.put("/frequencies/{item_id}", response_model=MasterResponse)
async def update_master_frequency(item_id: int, payload: MasterUpdate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    return update_frequency(db, clinic_id, item_id, payload.name)


@router.delete("/frequencies/{item_id}", status_code=204)
async def delete_master_frequency(item_id: int, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    if not delete_frequency(db, clinic_id, item_id):
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")


# Durations
@router.post("/durations", response_model=MasterResponse, status_code=201)
async def create_master_duration(payload: MasterCreate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    return create_duration(db, clinic_id, payload.name)


@router.put("/durations/{item_id}", response_model=MasterResponse)
async def update_master_duration(item_id: int, payload: MasterUpdate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    return update_duration(db, clinic_id, item_id, payload.name)


@router.delete("/durations/{item_id}", status_code=204)
async def delete_master_duration(item_id: int, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    if not delete_duration(db, clinic_id, item_id):
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")


# Quantities
@router.post("/quantities", response_model=MasterResponse, status_code=201)
async def create_master_quantity(payload: MasterCreate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    return create_quantity(db, clinic_id, payload.name)


@router.put("/quantities/{item_id}", response_model=MasterResponse)
async def update_master_quantity(item_id: int, payload: MasterUpdate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    return update_quantity(db, clinic_id, item_id, payload.name)


@router.delete("/quantities/{item_id}", status_code=204)
async def delete_master_quantity(item_id: int, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    if not delete_quantity(db, clinic_id, item_id):
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")


# Notes
@router.post("/notes", response_model=MasterResponse, status_code=201)
async def create_master_note(payload: MasterCreate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    return create_note(db, clinic_id, payload.name)


@router.put("/notes/{item_id}", response_model=MasterResponse)
async def update_master_note(item_id: int, payload: MasterUpdate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    return update_note(db, clinic_id, item_id, payload.name)


@router.delete("/notes/{item_id}", status_code=204)
async def delete_master_note(item_id: int, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    if not delete_note(db, clinic_id, item_id):
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
