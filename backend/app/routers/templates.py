from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.deps import get_clinic_id
from app.schemas.certificate_template import TemplateCreate, TemplateUpdate, TemplateResponse
from app.services.template_service import get_templates, get_template, create_template, update_template, delete_template

router = APIRouter(prefix="/api/templates", tags=["templates"])


@router.get("", response_model=list[TemplateResponse])
async def list_templates(db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    return get_templates(db, clinic_id)


@router.post("", response_model=TemplateResponse, status_code=status.HTTP_201_CREATED)
async def add_template(data: TemplateCreate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    return create_template(db, clinic_id, data)


@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template_detail(template_id: int, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    result = get_template(db, template_id, clinic_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    return result


@router.put("/{template_id}", response_model=TemplateResponse)
async def edit_template(template_id: int, data: TemplateUpdate, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    result = update_template(db, template_id, clinic_id, data)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    return result


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_template(template_id: int, db: Session = Depends(get_db), clinic_id: int = Depends(get_clinic_id)):
    if not delete_template(db, template_id, clinic_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
