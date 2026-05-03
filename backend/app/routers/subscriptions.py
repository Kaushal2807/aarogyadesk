from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.deps import require_admin
from app.schemas.subscription import SubscriptionCreate, SubscriptionRenew, SubscriptionResponse
from app.services.subscription_service import get_subscriptions, create_subscription, renew_subscription
from app.models.user import User

router = APIRouter(prefix="/api/subscriptions", tags=["subscriptions"])


@router.get("", response_model=list[SubscriptionResponse])
async def list_subscriptions(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return get_subscriptions(db)


@router.post("", response_model=SubscriptionResponse, status_code=status.HTTP_201_CREATED)
async def add_subscription(data: SubscriptionCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return create_subscription(db, data)


@router.put("/{subscription_id}/renew", response_model=SubscriptionResponse)
async def renew(subscription_id: int, data: SubscriptionRenew, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    result = renew_subscription(db, subscription_id, data)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found")
    return result
