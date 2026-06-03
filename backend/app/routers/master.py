from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.cache import cache_delete_pattern, cache_get, cache_set
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

MASTER_CACHE_TTL_SECONDS = 1800


def _master_cache_key(clinic_id: int, group: str) -> str:
    return f"clinic:{clinic_id}:master:{group}"


def _get_cached_master(clinic_id: int, group: str, loader):
    key = _master_cache_key(clinic_id, group)
    cached = cache_get(key)
    if cached is not None:
        return cached

    data = loader()
    cache_set(key, data, MASTER_CACHE_TTL_SECONDS)
    return data


def _invalidate_master(clinic_id: int, group: str) -> None:
    cache_delete_pattern(_master_cache_key(clinic_id, group))


@router.get("/medicines", response_model=list[MasterResponse])
def list_medicines(
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    return _get_cached_master(clinic_id, "medicines", lambda: get_all_medicines(db, clinic_id))


@router.get("/doses", response_model=list[MasterResponse])
def list_doses(
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    return _get_cached_master(clinic_id, "doses", lambda: get_all_doses(db, clinic_id))


@router.get("/frequencies", response_model=list[MasterResponse])
def list_frequencies(
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    return _get_cached_master(clinic_id, "frequencies", lambda: get_all_frequencies(db, clinic_id))


@router.get("/durations", response_model=list[MasterResponse])
def list_durations(
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    return _get_cached_master(clinic_id, "durations", lambda: get_all_durations(db, clinic_id))


@router.get("/quantities", response_model=list[MasterResponse])
def list_quantities(
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    return _get_cached_master(clinic_id, "quantities", lambda: get_all_quantities(db, clinic_id))


@router.get("/notes", response_model=list[MasterResponse])
def list_notes(
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    return _get_cached_master(clinic_id, "notes", lambda: get_all_notes(db, clinic_id))


# CRUD endpoints
@router.post("/medicines", response_model=MasterResponse, status_code=201)
def create_master_medicine(
    payload: MasterCreate,
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    item = create_medicine(db, clinic_id, payload.name)
    _invalidate_master(clinic_id, "medicines")
    return item


@router.put("/medicines/{item_id}", response_model=MasterResponse)
def update_master_medicine(
    item_id: int,
    payload: MasterUpdate,
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    item = update_medicine(db, clinic_id, item_id, payload.name)
    _invalidate_master(clinic_id, "medicines")
    return item


@router.delete("/medicines/{item_id}", status_code=204)
def delete_master_medicine(
    item_id: int,
    db: Session = Depends(get_db),
    clinic_id: int = Depends(get_clinic_id),
):
    if not delete_medicine(db, clinic_id, item_id):
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    _invalidate_master(clinic_id, "medicines")


# Doses
@router.post("/doses", response_model=MasterResponse, status_code=201)
def create_master_dose(payload: MasterCreate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    item = create_dose(db, clinic_id, payload.name)
    _invalidate_master(clinic_id, "doses")
    return item


@router.put("/doses/{item_id}", response_model=MasterResponse)
def update_master_dose(item_id: int, payload: MasterUpdate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    item = update_dose(db, clinic_id, item_id, payload.name)
    _invalidate_master(clinic_id, "doses")
    return item


@router.delete("/doses/{item_id}", status_code=204)
def delete_master_dose(item_id: int, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    if not delete_dose(db, clinic_id, item_id):
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    _invalidate_master(clinic_id, "doses")


# Frequencies
@router.post("/frequencies", response_model=MasterResponse, status_code=201)
def create_master_frequency(payload: MasterCreate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    item = create_frequency(db, clinic_id, payload.name)
    _invalidate_master(clinic_id, "frequencies")
    return item


@router.put("/frequencies/{item_id}", response_model=MasterResponse)
def update_master_frequency(item_id: int, payload: MasterUpdate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    item = update_frequency(db, clinic_id, item_id, payload.name)
    _invalidate_master(clinic_id, "frequencies")
    return item


@router.delete("/frequencies/{item_id}", status_code=204)
def delete_master_frequency(item_id: int, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    if not delete_frequency(db, clinic_id, item_id):
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    _invalidate_master(clinic_id, "frequencies")


# Durations
@router.post("/durations", response_model=MasterResponse, status_code=201)
def create_master_duration(payload: MasterCreate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    item = create_duration(db, clinic_id, payload.name)
    _invalidate_master(clinic_id, "durations")
    return item


@router.put("/durations/{item_id}", response_model=MasterResponse)
def update_master_duration(item_id: int, payload: MasterUpdate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    item = update_duration(db, clinic_id, item_id, payload.name)
    _invalidate_master(clinic_id, "durations")
    return item


@router.delete("/durations/{item_id}", status_code=204)
def delete_master_duration(item_id: int, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    if not delete_duration(db, clinic_id, item_id):
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    _invalidate_master(clinic_id, "durations")


# Quantities
@router.post("/quantities", response_model=MasterResponse, status_code=201)
def create_master_quantity(payload: MasterCreate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    item = create_quantity(db, clinic_id, payload.name)
    _invalidate_master(clinic_id, "quantities")
    return item


@router.put("/quantities/{item_id}", response_model=MasterResponse)
def update_master_quantity(item_id: int, payload: MasterUpdate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    item = update_quantity(db, clinic_id, item_id, payload.name)
    _invalidate_master(clinic_id, "quantities")
    return item


@router.delete("/quantities/{item_id}", status_code=204)
def delete_master_quantity(item_id: int, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    if not delete_quantity(db, clinic_id, item_id):
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    _invalidate_master(clinic_id, "quantities")


# Notes
@router.post("/notes", response_model=MasterResponse, status_code=201)
def create_master_note(payload: MasterCreate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    item = create_note(db, clinic_id, payload.name)
    _invalidate_master(clinic_id, "notes")
    return item


@router.put("/notes/{item_id}", response_model=MasterResponse)
def update_master_note(item_id: int, payload: MasterUpdate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    item = update_note(db, clinic_id, item_id, payload.name)
    _invalidate_master(clinic_id, "notes")
    return item


@router.delete("/notes/{item_id}", status_code=204)
def delete_master_note(item_id: int, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    if not delete_note(db, clinic_id, item_id):
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    _invalidate_master(clinic_id, "notes")
