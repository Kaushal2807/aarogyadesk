from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.cache import cache_delete_pattern, cache_get, cache_set
from app.db.database import get_db
from app.deps import get_clinic_id
from app.schemas.certificate_template import TemplateCreate, TemplateUpdate, TemplateResponse
from app.services.template_service import get_templates, get_template, create_template, update_template, delete_template

router = APIRouter(prefix="/api/templates", tags=["templates"])

TEMPLATE_CACHE_TTL_SECONDS = 1800


def _templates_cache_key(clinic_id: int) -> str:
    return f"clinic:{clinic_id}:templates:list"


def _template_cache_key(clinic_id: int, template_id: int) -> str:
    return f"clinic:{clinic_id}:templates:{template_id}"


def _invalidate_templates(clinic_id: int) -> None:
    cache_delete_pattern(f"clinic:{clinic_id}:templates*")


@router.get("", response_model=list[TemplateResponse])
def list_templates(db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    key = _templates_cache_key(clinic_id)
    cached = cache_get(key)
    if cached is not None:
        return cached

    data = get_templates(db, clinic_id)
    cache_set(key, data, TEMPLATE_CACHE_TTL_SECONDS)
    return data


@router.post("", response_model=TemplateResponse, status_code=status.HTTP_201_CREATED)
def add_template(data: TemplateCreate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    result = create_template(db, clinic_id, data)
    _invalidate_templates(clinic_id)
    return result


@router.get("/{template_id}", response_model=TemplateResponse)
def get_template_detail(template_id: int, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    key = _template_cache_key(clinic_id, template_id)
    cached = cache_get(key)
    if cached is not None:
        return cached

    result = get_template(db, clinic_id, template_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    cache_set(key, result, TEMPLATE_CACHE_TTL_SECONDS)
    return result


@router.put("/{template_id}", response_model=TemplateResponse)
def edit_template(template_id: int, data: TemplateUpdate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    result = update_template(db, clinic_id, template_id, data)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    _invalidate_templates(clinic_id)
    return result


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_template(template_id: int, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    if not delete_template(db, clinic_id, template_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    _invalidate_templates(clinic_id)
