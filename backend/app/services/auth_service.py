from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import hash_password, verify_password
from app.schemas.user import UserCreate
import hashlib


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, user: UserCreate):
    db_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),
        user_type=user.user_type,
        clinic_id=user.clinic_id,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def verify_password_with_md5_fallback(plain_password: str, hashed_password: str) -> bool:
    """Verify password with MD5 fallback for backward compatibility"""
    try:
        # Try bcrypt first
        return verify_password(plain_password, hashed_password)
    except Exception:
        # Fallback to MD5 for backward compatibility
        md5_hash = hashlib.md5(plain_password.encode()).hexdigest()
        return md5_hash == hashed_password


def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return False
    if not verify_password_with_md5_fallback(password, user.password):
        return False
    if user.status != "Active":
        return False
    return user
