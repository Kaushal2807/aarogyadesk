from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from app.db.base import CreatedOnlyModel


class User(CreatedOnlyModel):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    user_type = Column(Enum("admin", "clinic", name="user_type_enum"), nullable=False, default="clinic")
    clinic_id = Column(Integer, ForeignKey("clinic_data.clinic_id"), nullable=True)
    status = Column(Enum("Active", "Inactive", name="user_status_enum"), nullable=False, default="Active")
    login_status = Column(String(50))
