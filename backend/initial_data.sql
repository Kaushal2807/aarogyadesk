-- ============================================
-- AarogyaDesk Clinical Management System
-- Complete Database Schema (matching PHP)
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Clinic Data
CREATE TABLE IF NOT EXISTS clinic_data (
    clinic_id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_name VARCHAR(200) NOT NULL,
    clinic_code VARCHAR(20) UNIQUE NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(100),
    logo VARCHAR(500),
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    current_subscription_end DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_clinic_code (clinic_code)
);

-- Users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_type ENUM('admin', 'clinic') NOT NULL DEFAULT 'clinic',
    clinic_id INT,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    login_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_clinic_id (clinic_id),
    FOREIGN KEY (clinic_id) REFERENCES clinic_data(clinic_id) ON DELETE SET NULL
);

-- Patients
CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_id INT NOT NULL,
    patient_uid VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    age INT,
    contact_number VARCHAR(20),
    address TEXT,
    date_of_visit DATE,
    total_visit INT DEFAULT 1,
    notes TEXT,
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    payment_status ENUM('paid', 'partial', 'pending') DEFAULT 'pending',
    payment_pending DECIMAL(10,2) DEFAULT 0.00,
    chief_complain TEXT,
    medical_history TEXT,
    oral_diet_habit TEXT,
    family_history TEXT,
    xray_remark TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_clinic_id (clinic_id),
    INDEX idx_patient_uid (clinic_id, patient_uid),
    FOREIGN KEY (clinic_id) REFERENCES clinic_data(clinic_id) ON DELETE CASCADE
);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_id INT NOT NULL,
    patient_name VARCHAR(200) NOT NULL,
    age INT,
    contact_number VARCHAR(20),
    address TEXT,
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(10) NOT NULL,
    booking_type ENUM('call', 'walk-in') DEFAULT 'walk-in',
    status ENUM('pending', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_clinic_id (clinic_id),
    INDEX idx_appointment_date (appointment_date),
    FOREIGN KEY (clinic_id) REFERENCES clinic_data(clinic_id) ON DELETE CASCADE
);

-- Treatment Plans
CREATE TABLE IF NOT EXISTS treatment_plan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_id INT NOT NULL,
    diagnosis TEXT NOT NULL,
    treatment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_clinic_id (clinic_id),
    FOREIGN KEY (clinic_id) REFERENCES clinic_data(clinic_id) ON DELETE CASCADE
);

-- Patient Treatments
CREATE TABLE IF NOT EXISTS patient_treatments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_id INT NOT NULL,
    patient_uid VARCHAR(50) NOT NULL,
    patient_name VARCHAR(200) NOT NULL,
    tooth_upper_right VARCHAR(50),
    tooth_upper_left VARCHAR(50),
    tooth_lower_right VARCHAR(50),
    tooth_lower_left VARCHAR(50),
    diagnosis_id INT,
    treatment_id INT,
    estimates VARCHAR(200),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_clinic_id (clinic_id),
    INDEX idx_patient_uid (clinic_id, patient_uid),
    FOREIGN KEY (clinic_id) REFERENCES clinic_data(clinic_id) ON DELETE CASCADE,
    FOREIGN KEY (diagnosis_id) REFERENCES treatment_plan(id) ON DELETE SET NULL,
    FOREIGN KEY (treatment_id) REFERENCES treatment_plan(id) ON DELETE SET NULL
);

-- Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_id INT NOT NULL,
    patient_uid VARCHAR(50) NOT NULL,
    patient_name VARCHAR(200) NOT NULL,
    prescription_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_clinic_id (clinic_id),
    INDEX idx_patient_uid (clinic_id, patient_uid),
    FOREIGN KEY (clinic_id) REFERENCES clinic_data(clinic_id) ON DELETE CASCADE
);

-- Prescription Items
CREATE TABLE IF NOT EXISTS prescription_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prescription_id INT NOT NULL,
    clinic_id INT NOT NULL,
    drug_id INT,
    dose_id INT,
    frequency_id INT,
    duration_id INT,
    quantity_id INT,
    instruction TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE,
    FOREIGN KEY (clinic_id) REFERENCES clinic_data(clinic_id) ON DELETE CASCADE,
    FOREIGN KEY (drug_id) REFERENCES master_medicine(id) ON DELETE SET NULL,
    FOREIGN KEY (dose_id) REFERENCES master_dose(id) ON DELETE SET NULL,
    FOREIGN KEY (frequency_id) REFERENCES master_frequency(id) ON DELETE SET NULL,
    FOREIGN KEY (duration_id) REFERENCES master_duration(id) ON DELETE SET NULL,
    FOREIGN KEY (quantity_id) REFERENCES master_quantity(id) ON DELETE SET NULL
);

-- Master Tables
CREATE TABLE IF NOT EXISTS master_medicine (
    id INT AUTO_INCREMENT PRIMARY KEY,
        clinic_id INT REFERENCES clinic_data(clinic_id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS master_dose (
    id INT AUTO_INCREMENT PRIMARY KEY,
        clinic_id INT REFERENCES clinic_data(clinic_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS master_frequency (
    id INT AUTO_INCREMENT PRIMARY KEY,
        clinic_id INT REFERENCES clinic_data(clinic_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS master_duration (
    id INT AUTO_INCREMENT PRIMARY KEY,
        clinic_id INT REFERENCES clinic_data(clinic_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS master_quantity (
    id INT AUTO_INCREMENT PRIMARY KEY,
        clinic_id INT REFERENCES clinic_data(clinic_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS master_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
        clinic_id INT REFERENCES clinic_data(clinic_id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Work Done
CREATE TABLE IF NOT EXISTS work_done (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_id INT NOT NULL,
    work_name VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_clinic_id (clinic_id),
    FOREIGN KEY (clinic_id) REFERENCES clinic_data(clinic_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS patient_work_done (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_id INT NOT NULL,
    patient_uid VARCHAR(50) NOT NULL,
    patient_name VARCHAR(200) NOT NULL,
    work_done_id INT,
    description TEXT,
    work_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_clinic_id (clinic_id),
    INDEX idx_patient_uid (clinic_id, patient_uid),
    FOREIGN KEY (clinic_id) REFERENCES clinic_data(clinic_id) ON DELETE CASCADE,
    FOREIGN KEY (work_done_id) REFERENCES work_done(id) ON DELETE SET NULL
);

-- Expense Categories
CREATE TABLE IF NOT EXISTS expense_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_id INT NOT NULL,
    category_name VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_clinic_id (clinic_id),
    FOREIGN KEY (clinic_id) REFERENCES clinic_data(clinic_id) ON DELETE CASCADE
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_id INT NOT NULL,
    category_id INT,
    expense_month INT,
    expense_year INT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    payment_mode ENUM('Cash', 'UPI') DEFAULT 'Cash',
    expense_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_clinic_id (clinic_id),
    INDEX idx_expense_date (expense_date),
    FOREIGN KEY (clinic_id) REFERENCES clinic_data(clinic_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES expense_categories(id) ON DELETE SET NULL
);

-- Medicine Inventory
CREATE TABLE IF NOT EXISTS medicine (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    quantity INT UNSIGNED DEFAULT 0,
    threshold_level INT UNSIGNED DEFAULT 10,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_clinic_id (clinic_id),
    FOREIGN KEY (clinic_id) REFERENCES clinic_data(clinic_id) ON DELETE CASCADE
);

-- Clinic Subscriptions
CREATE TABLE IF NOT EXISTS clinic_subscriptions (
    subscription_id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_id INT NOT NULL,
    plan_type ENUM('1 Month', '6 Months', '1 Year'),
    plan_amount DECIMAL(10,2),
    payment_status ENUM('Paid', 'Pending', 'Partial') DEFAULT 'Paid',
    payment_method ENUM('Cash', 'UPI', 'Cheque'),
    transaction_reference VARCHAR(200),
    received_by VARCHAR(200),
    start_date DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_clinic_id (clinic_id),
    FOREIGN KEY (clinic_id) REFERENCES clinic_data(clinic_id) ON DELETE CASCADE
);

-- Clinic Doctors
CREATE TABLE IF NOT EXISTS clinic_doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_id INT NOT NULL,
    doctor_name VARCHAR(200) NOT NULL,
    doctor_position VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_clinic_id (clinic_id),
    FOREIGN KEY (clinic_id) REFERENCES clinic_data(clinic_id) ON DELETE CASCADE
);

-- Certificate Templates
CREATE TABLE IF NOT EXISTS certificate_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_id INT NOT NULL,
    template_name VARCHAR(200) NOT NULL,
    template_content LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_clinic_id (clinic_id),
    FOREIGN KEY (clinic_id) REFERENCES clinic_data(clinic_id) ON DELETE CASCADE
);

-- Support Queries
CREATE TABLE IF NOT EXISTS user_query (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_id INT NOT NULL,
    clinic_name VARCHAR(200),
    person_name VARCHAR(200) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    status TINYINT DEFAULT 0,
    resolved_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_clinic_id (clinic_id),
    FOREIGN KEY (clinic_id) REFERENCES clinic_data(clinic_id) ON DELETE CASCADE
);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- Seed Data
-- ============================================

-- Default clinic
INSERT IGNORE INTO clinic_data (clinic_name, clinic_code, address, phone, email, status)
VALUES ('Smile Well Dental Clinic', 'SWA', '12, Hazratganj, Lucknow', '0522-1234567', 'info@smilewell.com', 'Active');

-- Default admin user (password: admin123 - bcrypt hash)
INSERT IGNORE INTO users (name, email, password, user_type, clinic_id, status)
VALUES ('Admin', 'admin@aarogyadesk.com', '$2b$12$LJ3m4ys3dPMlF/1kYQMBBOIrBg6MwTm/QmD7JHwFg0wP3yJcH1tOe', 'admin', NULL, 'Active');

-- Master prescription data
INSERT IGNORE INTO master_medicine (name) VALUES
('Amoxicillin 500mg'), ('Ibuprofen 400mg'), ('Metronidazole 400mg'), ('Chlorhexidine Gel'),
('Diclofenac Gel'), ('Pantoprazole 40mg'), ('Potassium Nitrate'), ('Calcium + Vitamin D3'),
('Azithromycin 500mg'), ('Paracetamol 500mg');

INSERT IGNORE INTO master_dose (name) VALUES
('500mg'), ('400mg'), ('200mg'), ('100mg'), ('40mg'), ('1%', ('0.2%'), '250mg');

INSERT IGNORE INTO master_frequency (name) VALUES
('Once daily'), ('2 times a day'), ('3 times a day'), ('As needed'), ('At bedtime'), ('Weekly');

INSERT IGNORE INTO master_duration (name) VALUES
('3 days'), ('5 days'), ('7 days'), ('10 days'), ('14 days'), ('30 days');

INSERT IGNORE INTO master_quantity (name) VALUES
('10 tablets'), ('15 tablets'), ('21 tablets'), ('1 tube'), ('1 bottle'), ('30 tablets');

INSERT IGNORE INTO master_notes (name) VALUES
('After food'), ('Before food'), ('Local application'), ('Apply on affected area'),
('At bedtime'), ('Dissolve in water'), ('As needed');
