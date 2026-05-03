from sqlalchemy.orm import Session
from app.models.certificate_template import CertificateTemplate
from app.schemas.certificate_template import TemplateCreate, TemplateUpdate


def get_templates(db: Session, clinic_id: int, skip: int = 0, limit: int = 100):
    return (
        db.query(CertificateTemplate)
        .filter(CertificateTemplate.clinic_id == clinic_id)
        .order_by(CertificateTemplate.template_name)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_template(db: Session, clinic_id: int, template_id: int):
    return (
        db.query(CertificateTemplate)
        .filter(CertificateTemplate.clinic_id == clinic_id, CertificateTemplate.id == template_id)
        .first()
    )


def create_template(db: Session, clinic_id: int, data: TemplateCreate):
    template = CertificateTemplate(clinic_id=clinic_id, **data.model_dump())
    db.add(template)
    db.commit()
    db.refresh(template)
    return template


def update_template(db: Session, clinic_id: int, template_id: int, data: TemplateUpdate):
    template = get_template(db, clinic_id, template_id)
    if not template:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(template, field, value)
    db.add(template)
    db.commit()
    db.refresh(template)
    return template


def delete_template(db: Session, clinic_id: int, template_id: int):
    template = get_template(db, clinic_id, template_id)
    if not template:
        return False
    db.delete(template)
    db.commit()
    return True
