from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import hash_password


def get_users(db: Session, skip: int = 0, limit: int = 100, search: str = None):
    query = db.query(User)
    if search:
        q = f"%{search}%"
        query = query.filter(
            or_(User.name.ilike(q), User.email.ilike(q))
        )
    return query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()


def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, data: UserCreate):
    user = User(
        name=data.name,
        email=data.email,
        password=hash_password(data.password),
        user_type=data.user_type,
        clinic_id=data.clinic_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user_id: int, data: UserUpdate):
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        if field == "password" and value is not None:
            value = hash_password(value)
        setattr(user, field, value)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: int):
    user = get_user_by_id(db, user_id)
    if not user:
        return False
    db.delete(user)
    db.commit()
    return True


def update_user_status(db: Session, user_id: int, status_val: str):
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    user.status = status_val
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def reset_password(db: Session, user_id: int, new_password: str):
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    user.password = hash_password(new_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
