from datetime import datetime
from sqlalchemy.orm import Session
from app.models.user_query import UserQuery
from app.models.clinic import ClinicData
from app.models.user import User
from app.schemas.support import SupportCreate


def create_query(db: Session, current_user: User, data: SupportCreate):
    """Create a support query from an authenticated clinic or admin user."""
    clinic_name = None
    clinic_id = current_user.clinic_id
    email = current_user.email
    phone = None

    if clinic_id:
        clinic = db.query(ClinicData).filter(ClinicData.clinic_id == clinic_id).first()
        if clinic:
            clinic_name = clinic.clinic_name

    query = UserQuery(
        clinic_id=clinic_id or 0,
        clinic_name=clinic_name,
        person_name=data.person_name,
        email=email,
        phone=phone,
        subject=data.subject,
        message=data.message,
        status=0,
    )
    db.add(query)
    db.commit()
    db.refresh(query)
    return query


def get_queries(db: Session, skip: int = 0, limit: int = 100, status: int = None):
    query = db.query(UserQuery)
    if status is not None:
        query = query.filter(UserQuery.status == status)
    return query.order_by(UserQuery.created_at.desc()).offset(skip).limit(limit).all()


def get_query(db: Session, query_id: int):
    return db.query(UserQuery).filter(UserQuery.id == query_id).first()


def resolve_query(db: Session, query_id: int):
    query = get_query(db, query_id)
    if not query:
        return None
    query.status = 1
    query.resolved_at = datetime.utcnow()
    db.add(query)
    db.commit()
    db.refresh(query)
    return query
