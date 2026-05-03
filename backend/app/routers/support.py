from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.deps import get_current_user, require_admin
from app.schemas.support import SupportCreate, SupportResponse
from app.services.support_service import create_query, get_queries, get_query, resolve_query
from app.models.user import User

router = APIRouter(prefix="/api/support", tags=["support"])


@router.post("", response_model=SupportResponse, status_code=status.HTTP_201_CREATED)
async def submit_query(data: SupportCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return create_query(db, current_user, data)


@router.get("", response_model=list[SupportResponse])
async def list_queries(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return get_queries(db)


@router.get("/{query_id}", response_model=SupportResponse)
async def get_query_detail(query_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    result = get_query(db, query_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Query not found")
    return result


@router.put("/{query_id}/resolve", response_model=SupportResponse)
async def resolve(query_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    result = resolve_query(db, query_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Query not found")
    return result
