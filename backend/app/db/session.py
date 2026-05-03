from sqlalchemy.orm import Session
from app.db.database import SessionLocal

def get_session() -> Session:
    """Get a database session"""
    return SessionLocal()
