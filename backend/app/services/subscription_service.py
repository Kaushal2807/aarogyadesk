from sqlalchemy.orm import Session
from datetime import date
from app.models.subscription import ClinicSubscription
from app.models.clinic import ClinicData
from app.schemas.subscription import SubscriptionCreate, SubscriptionRenew, SubscriptionResponse


def get_subscriptions(db: Session, skip: int = 0, limit: int = 100):
    rows = (
        db.query(ClinicSubscription, ClinicData.clinic_name)
        .outerjoin(ClinicData, ClinicSubscription.clinic_id == ClinicData.clinic_id)
        .order_by(ClinicSubscription.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    result = []
    for sub, clinic_name in rows:
        data = SubscriptionResponse.model_validate(sub).model_dump()
        data['clinic_name'] = clinic_name
        result.append(data)
    return result


def get_subscription(db: Session, subscription_id: int):
    return (
        db.query(ClinicSubscription)
        .filter(ClinicSubscription.subscription_id == subscription_id)
        .first()
    )


def get_by_clinic(db: Session, clinic_id: int):
    return (
        db.query(ClinicSubscription)
        .filter(ClinicSubscription.clinic_id == clinic_id)
        .order_by(ClinicSubscription.created_at.desc())
        .all()
    )


def create_subscription(db: Session, data: SubscriptionCreate):
    subscription = ClinicSubscription(**data.model_dump())
    db.add(subscription)
    db.commit()
    db.refresh(subscription)

    # Update clinic's subscription end date
    clinic = db.query(ClinicData).filter(ClinicData.clinic_id == data.clinic_id).first()
    if clinic and data.end_date:
        clinic.current_subscription_end = data.end_date
        db.add(clinic)
        db.commit()

    return subscription


def renew_subscription(db: Session, subscription_id: int, data: SubscriptionRenew):
    subscription = get_subscription(db, subscription_id)
    if not subscription:
        return None

    subscription.plan_type = data.plan_type
    subscription.plan_amount = data.plan_amount
    subscription.payment_status = data.payment_status
    if data.payment_method is not None:
        subscription.payment_method = data.payment_method
    if data.transaction_reference is not None:
        subscription.transaction_reference = data.transaction_reference
    if data.received_by is not None:
        subscription.received_by = data.received_by
    if data.start_date is not None:
        subscription.start_date = data.start_date
    if data.end_date is not None:
        subscription.end_date = data.end_date
        clinic = db.query(ClinicData).filter(ClinicData.clinic_id == subscription.clinic_id).first()
        if clinic:
            clinic.current_subscription_end = data.end_date

    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return subscription
