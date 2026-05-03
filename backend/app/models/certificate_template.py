from sqlalchemy import Column, Integer, String, Text, ForeignKey
from app.db.base import BaseModel


class CertificateTemplate(BaseModel):
    __tablename__ = "certificate_templates"
    id = Column(Integer, primary_key=True, autoincrement=True)
    clinic_id = Column(Integer, ForeignKey("clinic_data.clinic_id"), nullable=False)
    template_name = Column(String(200), nullable=False)
    template_content = Column(Text)


class CaseTemplate(BaseModel):
    __tablename__ = "case_templates"
    id = Column(Integer, primary_key=True, autoincrement=True)
    clinic_id = Column(Integer, ForeignKey("clinic_data.clinic_id"), nullable=False)
    template_name = Column(String(200), nullable=False)
    template_content = Column(Text)
