from fastapi import Depends, HTTPException, status
from app.db.database import get_db
from app.core.security import decode_token
from app.models.user import User
from sqlalchemy.orm import Session
from starlette.requests import Request


async def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
) -> User:
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authorization header")
    try:
        scheme, token = auth_header.split()
        if scheme.lower() != "bearer":
            raise ValueError()
    except (ValueError, AttributeError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authorization header format")

    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")

    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user


def require_clinic_user(current_user: User = Depends(get_current_user)) -> int:
    if not current_user.clinic_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Clinic access required")
    return current_user.clinic_id


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.user_type != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


# Alias used by routers to extract clinic_id from the current user
get_clinic_id = require_clinic_user
