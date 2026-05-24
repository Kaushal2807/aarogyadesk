from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from datetime import timedelta
from app.db.database import get_db
from app.schemas.user import LoginRequest, TokenResponse, UserCreate, UserResponse
from app.services.auth_service import authenticate_user, create_user, get_user_by_email
from app.core.security import create_access_token
from app.core.config import settings
from app.deps import get_current_user, require_admin
from app.models.user import User
from app.models.clinic import ClinicData

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = authenticate_user(db, request.email, request.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if user.status == 'Inactive':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is inactive")

    if user.clinic_id:
        clinic = db.query(ClinicData).filter(ClinicData.clinic_id == user.clinic_id).first()
        if clinic and clinic.status == 'Inactive':
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Clinic is inactive")

    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes)
    )
    
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        secure=True,          # Always secure in production (Render uses HTTPS)
        samesite="none",      # Required for cross-origin (Vercel -> Render)
        max_age=settings.access_token_expire_minutes * 60
    )
    
    return {"access_token": access_token, "token_type": "bearer", "user": UserResponse.model_validate(user)}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=True,
        samesite="none"
    )
    return {"message": "Logged out successfully"}


@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    existing = get_user_by_email(db, user.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    db_user = create_user(db, user)
    return UserResponse.model_validate(db_user)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)
