import os
import hashlib
from fastapi import APIRouter, HTTPException
from sqlalchemy import text, inspect
from sqlalchemy.orm import Session
from app.db.database import engine, SessionLocal
from app.core.security import hash_password

router = APIRouter(tags=["setup"])


def get_md5(password: str) -> str:
    return hashlib.md5(password.encode()).hexdigest()


TABLES_SQL = [
    """CREATE TABLE IF NOT EXISTS clinic_data (
        clinic_id SERIAL PRIMARY KEY,
        clinic_name VARCHAR(200) NOT NULL,
        clinic_code VARCHAR(20) UNIQUE NOT NULL,
        address TEXT,
        phone VARCHAR(50),
        email VARCHAR(100),
        logo VARCHAR(500),
        status VARCHAR(20) DEFAULT 'Active',
        current_subscription_end DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""",
    """CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        user_type VARCHAR(10) NOT NULL DEFAULT 'clinic',
        clinic_id INTEGER REFERENCES clinic_data(clinic_id) ON DELETE SET NULL,
        status VARCHAR(10) NOT NULL DEFAULT 'Active',
        login_status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""",
    """CREATE TABLE IF NOT EXISTS clinic_subscriptions (
        subscription_id SERIAL PRIMARY KEY,
        clinic_id INTEGER NOT NULL REFERENCES clinic_data(clinic_id) ON DELETE CASCADE,
        plan_type VARCHAR(20),
        plan_amount DECIMAL(10,2),
        payment_status VARCHAR(10) DEFAULT 'Paid',
        payment_method VARCHAR(20),
        transaction_reference VARCHAR(200),
        received_by VARCHAR(200),
        start_date DATE,
        end_date DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""",
    """CREATE TABLE IF NOT EXISTS clinic_doctors (
        id SERIAL PRIMARY KEY,
        clinic_id INTEGER NOT NULL REFERENCES clinic_data(clinic_id) ON DELETE CASCADE,
        doctor_name VARCHAR(200) NOT NULL,
        doctor_position VARCHAR(200),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""",
    """CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        clinic_id INTEGER NOT NULL REFERENCES clinic_data(clinic_id) ON DELETE CASCADE,
        patient_uid VARCHAR(50) NOT NULL,
        name VARCHAR(200) NOT NULL,
        age INTEGER,
        contact_number VARCHAR(20),
        address TEXT,
        date_of_visit DATE,
        total_visit INTEGER DEFAULT 1,
        notes TEXT,
        total_amount DECIMAL(10,2) DEFAULT 0,
        payment_status VARCHAR(10) DEFAULT 'pending',
        payment_pending DECIMAL(10,2) DEFAULT 0,
        chief_complain TEXT,
        medical_history TEXT,
        oral_diet_habit TEXT,
        family_history TEXT,
        xray_remark TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""",
    """CREATE TABLE IF NOT EXISTS treatment_plan (
        id SERIAL PRIMARY KEY,
        clinic_id INTEGER NOT NULL REFERENCES clinic_data(clinic_id) ON DELETE CASCADE,
        diagnosis TEXT NOT NULL,
        treatment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""",
    """CREATE TABLE IF NOT EXISTS work_done (
        id SERIAL PRIMARY KEY,
        clinic_id INTEGER NOT NULL REFERENCES clinic_data(clinic_id) ON DELETE CASCADE,
        work_name VARCHAR(200) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""",
    """CREATE TABLE IF NOT EXISTS master_medicine (
        id SERIAL PRIMARY KEY,
        clinic_id INTEGER REFERENCES clinic_data(clinic_id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""",
    """CREATE TABLE IF NOT EXISTS master_dose (
        id SERIAL PRIMARY KEY,
        clinic_id INTEGER REFERENCES clinic_data(clinic_id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""",
    """CREATE TABLE IF NOT EXISTS master_frequency (
        id SERIAL PRIMARY KEY,
        clinic_id INTEGER REFERENCES clinic_data(clinic_id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""",
    """CREATE TABLE IF NOT EXISTS master_duration (
        id SERIAL PRIMARY KEY,
        clinic_id INTEGER REFERENCES clinic_data(clinic_id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""",
    """CREATE TABLE IF NOT EXISTS master_quantity (
        id SERIAL PRIMARY KEY,
        clinic_id INTEGER REFERENCES clinic_data(clinic_id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""",
    """CREATE TABLE IF NOT EXISTS master_notes (
        id SERIAL PRIMARY KEY,
        clinic_id INTEGER REFERENCES clinic_data(clinic_id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""",
    """CREATE TABLE IF NOT EXISTS prescriptions (
        id SERIAL PRIMARY KEY,
        clinic_id INTEGER NOT NULL REFERENCES clinic_data(clinic_id) ON DELETE CASCADE,
        patient_uid VARCHAR(50) NOT NULL,
        patient_name VARCHAR(200) NOT NULL,
        prescription_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""",
    """CREATE TABLE IF NOT EXISTS prescription_items (
        id SERIAL PRIMARY KEY,
        prescription_id INTEGER NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
        clinic_id INTEGER NOT NULL REFERENCES clinic_data(clinic_id) ON DELETE CASCADE,
        drug_id INTEGER REFERENCES master_medicine(id) ON DELETE SET NULL,
        dose_id INTEGER REFERENCES master_dose(id) ON DELETE SET NULL,
        frequency_id INTEGER REFERENCES master_frequency(id) ON DELETE SET NULL,
        duration_id INTEGER REFERENCES master_duration(id) ON DELETE SET NULL,
        quantity_id INTEGER REFERENCES master_quantity(id) ON DELETE SET NULL,
        instruction TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""",
    """CREATE TABLE IF NOT EXISTS patient_work_done (
        id SERIAL PRIMARY KEY,
        clinic_id INTEGER NOT NULL REFERENCES clinic_data(clinic_id) ON DELETE CASCADE,
        patient_uid VARCHAR(50) NOT NULL,
        patient_name VARCHAR(200) NOT NULL,
        work_done_id INTEGER REFERENCES work_done(id) ON DELETE SET NULL,
        description TEXT,
        work_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""",
    """CREATE TABLE IF NOT EXISTS patient_treatments (
        id SERIAL PRIMARY KEY,
        clinic_id INTEGER NOT NULL REFERENCES clinic_data(clinic_id) ON DELETE CASCADE,
        patient_uid VARCHAR(50) NOT NULL,
        patient_name VARCHAR(200) NOT NULL,
        tooth_upper_right VARCHAR(50),
        tooth_upper_left VARCHAR(50),
        tooth_lower_right VARCHAR(50),
        tooth_lower_left VARCHAR(50),
        diagnosis_id INTEGER REFERENCES treatment_plan(id) ON DELETE SET NULL,
        treatment_id INTEGER REFERENCES treatment_plan(id) ON DELETE SET NULL,
        estimates VARCHAR(200),
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""",
    """CREATE TABLE IF NOT EXISTS medicine (
        id SERIAL PRIMARY KEY,
        clinic_id INTEGER NOT NULL REFERENCES clinic_data(clinic_id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        quantity INTEGER DEFAULT 0,
        threshold_level INTEGER DEFAULT 10,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""",
    """CREATE TABLE IF NOT EXISTS expense_categories (
        id SERIAL PRIMARY KEY,
        clinic_id INTEGER NOT NULL REFERENCES clinic_data(clinic_id) ON DELETE CASCADE,
        category_name VARCHAR(200) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""",
    """CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        clinic_id INTEGER NOT NULL REFERENCES clinic_data(clinic_id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES expense_categories(id) ON DELETE SET NULL,
        expense_month INTEGER,
        expense_year INTEGER,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        amount DECIMAL(10,2) NOT NULL,
        payment_mode VARCHAR(10) DEFAULT 'Cash',
        expense_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""",
    """CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        clinic_id INTEGER NOT NULL REFERENCES clinic_data(clinic_id) ON DELETE CASCADE,
        patient_name VARCHAR(200) NOT NULL,
        age INTEGER,
        contact_number VARCHAR(20),
        address TEXT,
        appointment_date DATE NOT NULL,
        appointment_time VARCHAR(10) NOT NULL,
        booking_type VARCHAR(10) DEFAULT 'walk-in',
        status VARCHAR(10) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""",
    """CREATE TABLE IF NOT EXISTS user_query (
        id SERIAL PRIMARY KEY,
        clinic_id INTEGER NOT NULL REFERENCES clinic_data(clinic_id) ON DELETE CASCADE,
        clinic_name VARCHAR(200),
        person_name VARCHAR(200) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20),
        subject VARCHAR(500) NOT NULL,
        message TEXT NOT NULL,
        status INTEGER DEFAULT 0,
        resolved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""",
    """CREATE TABLE IF NOT EXISTS certificate_templates (
        id SERIAL PRIMARY KEY,
        clinic_id INTEGER NOT NULL REFERENCES clinic_data(clinic_id) ON DELETE CASCADE,
        template_name VARCHAR(200) NOT NULL,
        template_content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""",
    """CREATE TABLE IF NOT EXISTS case_templates (
        id SERIAL PRIMARY KEY,
        clinic_id INTEGER NOT NULL REFERENCES clinic_data(clinic_id) ON DELETE CASCADE,
        template_name VARCHAR(200) NOT NULL,
        template_content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""",
    """CREATE TABLE IF NOT EXISTS master_diagnosis (
        id SERIAL PRIMARY KEY,
        clinic_id INTEGER NOT NULL REFERENCES clinic_data(clinic_id) ON DELETE CASCADE,
        diagnosis_name VARCHAR(300) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""",
    """CREATE TABLE IF NOT EXISTS master_treatment_option (
        id SERIAL PRIMARY KEY,
        clinic_id INTEGER NOT NULL REFERENCES clinic_data(clinic_id) ON DELETE CASCADE,
        treatment_name VARCHAR(300) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""",
]

SEED_MASTER_SQL = [
    "INSERT INTO master_medicine (name) VALUES ('Amoxicillin 500mg')",
    "INSERT INTO master_medicine (name) VALUES ('Ibuprofen 400mg')",
    "INSERT INTO master_medicine (name) VALUES ('Metronidazole 400mg')",
    "INSERT INTO master_medicine (name) VALUES ('Chlorhexidine Gel')",
    "INSERT INTO master_medicine (name) VALUES ('Diclofenac Gel')",
    "INSERT INTO master_medicine (name) VALUES ('Pantoprazole 40mg')",
    "INSERT INTO master_medicine (name) VALUES ('Potassium Nitrate')",
    "INSERT INTO master_medicine (name) VALUES ('Calcium + Vitamin D3')",
    "INSERT INTO master_medicine (name) VALUES ('Azithromycin 500mg')",
    "INSERT INTO master_medicine (name) VALUES ('Paracetamol 500mg')",
    "INSERT INTO master_dose (name) VALUES ('500mg')",
    "INSERT INTO master_dose (name) VALUES ('400mg')",
    "INSERT INTO master_dose (name) VALUES ('200mg')",
    "INSERT INTO master_dose (name) VALUES ('100mg')",
    "INSERT INTO master_dose (name) VALUES ('40mg')",
    "INSERT INTO master_dose (name) VALUES ('1%')",
    "INSERT INTO master_dose (name) VALUES ('0.2%')",
    "INSERT INTO master_dose (name) VALUES ('250mg')",
    "INSERT INTO master_frequency (name) VALUES ('Once daily')",
    "INSERT INTO master_frequency (name) VALUES ('2 times a day')",
    "INSERT INTO master_frequency (name) VALUES ('3 times a day')",
    "INSERT INTO master_frequency (name) VALUES ('As needed')",
    "INSERT INTO master_frequency (name) VALUES ('At bedtime')",
    "INSERT INTO master_frequency (name) VALUES ('Weekly')",
    "INSERT INTO master_duration (name) VALUES ('3 days')",
    "INSERT INTO master_duration (name) VALUES ('5 days')",
    "INSERT INTO master_duration (name) VALUES ('7 days')",
    "INSERT INTO master_duration (name) VALUES ('10 days')",
    "INSERT INTO master_duration (name) VALUES ('14 days')",
    "INSERT INTO master_duration (name) VALUES ('30 days')",
    "INSERT INTO master_quantity (name) VALUES ('10 tablets')",
    "INSERT INTO master_quantity (name) VALUES ('15 tablets')",
    "INSERT INTO master_quantity (name) VALUES ('21 tablets')",
    "INSERT INTO master_quantity (name) VALUES ('1 tube')",
    "INSERT INTO master_quantity (name) VALUES ('1 bottle')",
    "INSERT INTO master_quantity (name) VALUES ('30 tablets')",
    "INSERT INTO master_notes (name) VALUES ('After food')",
    "INSERT INTO master_notes (name) VALUES ('Before food')",
    "INSERT INTO master_notes (name) VALUES ('Local application')",
    "INSERT INTO master_notes (name) VALUES ('Apply on affected area')",
    "INSERT INTO master_notes (name) VALUES ('At bedtime')",
    "INSERT INTO master_notes (name) VALUES ('Dissolve in water')",
    "INSERT INTO master_notes (name) VALUES ('As needed')",
]

SEED_ADMIN_SQL = """
INSERT INTO clinic_data (clinic_name, clinic_code, address, phone, email, status)
VALUES ('AarogyaDesk Dental', 'SWA', 'Default', '9876543210', 'admin@aarogyadesk.com', 'Active')
ON CONFLICT DO NOTHING;

INSERT INTO users (name, email, password, user_type, clinic_id, status)
VALUES ('admin', 'admin@admin.com', :password, 'admin', NULL, 'Active')
ON CONFLICT DO NOTHING;
"""


@router.get("/setup")
async def check_setup():
    """Check if setup has already been run"""
    try:
        db = SessionLocal()
        result = db.execute(text("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'")).scalar()
        db.close()
        if result > 0:
            return {"setup": True, "message": "Database already set up", "tables": result}
        return {"setup": False, "message": "Database needs setup"}
    except Exception as e:
        return {"setup": False, "message": f"Database error: {str(e)}"}


@router.post("/setup")
async def run_setup():
    """Create all tables and seed data"""
    try:
        db = SessionLocal()

        # Check if already set up
        result = db.execute(text("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'")).scalar()
        if result > 0:
            db.close()
            raise HTTPException(status_code=400, detail="Database already set up. Tables already exist.")

        # Create all tables
        for sql in TABLES_SQL:
            db.execute(text(sql))
        db.commit()

        # Insert seed master data
        for sql in SEED_MASTER_SQL:
            db.execute(text(sql))
        db.commit()

        # Insert admin user
        admin_password_hash = hash_password("admin123")
        db.execute(
            text(SEED_ADMIN_SQL),
            {"password": admin_password_hash}
        )
        db.commit()

        db.close()

        return {
            "success": True,
            "message": "Database setup complete!",
            "tables_created": len(TABLES_SQL),
            "admin_email": "admin@admin.com",
            "admin_password": "admin123",
            "master_records_seeded": len(SEED_MASTER_SQL),
        }
    except Exception as e:
        return {"success": False, "message": f"Setup failed: {str(e)}"}
