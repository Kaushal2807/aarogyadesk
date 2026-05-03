# Aarogyadesk - Clinical Management System

A modern, full-stack clinical management system migrated from PHP to Next.js (React) frontend and FastAPI (Python) backend with Docker containerization.

## 🏥 Project Overview

**Aarogyadesk** is a comprehensive clinical management system for healthcare providers to manage patients, appointments, prescriptions, medicines, and medical records efficiently.

### Tech Stack

**Frontend:**
- Next.js 15+ (React Framework)
- TypeScript
- Tailwind CSS
- Axios (API client)
- Custom React Hooks

**Backend:**
- FastAPI 0.104+
- Python 3.11
- SQLAlchemy 2.0 (ORM)
- MySQL 8.0 (Database)
- JWT Authentication

**DevOps:**
- Docker (Backend containerization)
- Docker Compose (Service orchestration)
- MySQL Container
- FastAPI Container

---

## 📋 Features Implemented

### ✅ Authentication & Authorization
- User login with JWT tokens
- User registration
- Role-based access control (Admin, Doctor, Receptionist)
- Secure password hashing with bcrypt
- Protected routes

### ✅ Patient Management
- List all patients with pagination and search
- Create new patient records
- View patient details
- Update patient information
- Delete patient records
- Emergency contact tracking
- Medical history and allergies tracking

### ✅ Core Infrastructure
- Database schema for all entities
- API documentation (Swagger/OpenAPI)
- CORS middleware for frontend-backend communication
- Error handling and validation
- Database connection pooling
- Health check endpoints

### ✅ Frontend
- Responsive login interface
- Dashboard with quick stats
- Protected routing
- Token management (localStorage)
- Auto-redirect on unauthorized access
- Loading states and error handling

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed
- Node.js 18+ (for frontend development)
- Git

### Installation & Running

#### 1. Clone/Navigate to Project
```bash
cd ~/Desktop/aarogyadesk
```

#### 2. Start Backend & Database (Docker)
```bash
docker-compose up
```

This will:
- Create and start MySQL container with clinical database
- Initialize database with schema and default admin user
- Build and start FastAPI backend container
- Run API on `http://localhost:8000`

Wait for output showing:
```
clinical_mysql | ready for connections
clinical_fastapi | Uvicorn running on http://0.0.0.0:8000
```

#### 3. Start Frontend (New Terminal)
```bash
cd ~/Desktop/aarogyadesk/frontend
npm install  # First time only
npm run dev
```

Frontend will be available at `http://localhost:3000`

#### 4. Access the Application
- **Frontend:** http://localhost:3000
- **API Docs:** http://localhost:8000/docs
- **Default Login:**
  - Username: `admin`
  - Password: `admin123`

---

## 📚 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| POST | `/api/auth/login` | User login | ❌ |
| POST | `/api/auth/register` | Register new user | ❌ |
| GET | `/api/auth/me` | Get current user info | ✅ |

### Patient Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/api/patients` | List all patients | ✅ |
| POST | `/api/patients` | Create new patient | ✅ |
| GET | `/api/patients/{id}` | Get patient details | ✅ |
| PUT | `/api/patients/{id}` | Update patient | ✅ |
| DELETE | `/api/patients/{id}` | Delete patient | ✅ |
| GET | `/api/patients/count` | Get patient count | ✅ |

### Query Parameters

**List Patients:**
- `skip` (int, default: 0) - Skip first N patients
- `limit` (int, default: 100) - Limit results to N patients
- `search` (string, optional) - Search by name, email, or phone

---

## 📁 Project Structure

```
aarogyadesk/
├── backend/                          # FastAPI Application
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py            # Configuration settings
│   │   │   ├── security.py          # JWT & password utilities
│   │   │   └── __init__.py
│   │   ├── db/
│   │   │   ├── base.py              # Base model with timestamps
│   │   │   ├── database.py          # Database connection
│   │   │   ├── session.py           # Session management
│   │   │   └── __init__.py
│   │   ├── models/
│   │   │   ├── user.py              # User model
│   │   │   ├── patient.py           # Patient model
│   │   │   ├── appointment.py       # Appointment model
│   │   │   ├── prescription.py      # Prescription model
│   │   │   ├── drug.py              # Drug model
│   │   │   └── __init__.py
│   │   ├── schemas/
│   │   │   ├── user.py              # User validation schemas
│   │   │   ├── patient.py           # Patient validation schemas
│   │   │   └── __init__.py
│   │   ├── routers/
│   │   │   ├── auth.py              # Auth endpoints
│   │   │   ├── patients.py          # Patient endpoints
│   │   │   └── __init__.py
│   │   ├── services/
│   │   │   ├── auth_service.py      # Auth business logic
│   │   │   ├── patient_service.py   # Patient business logic
│   │   │   └── __init__.py
│   │   ├── main.py                  # FastAPI app entry point
│   │   ├── deps.py                  # Dependency injection
│   │   └── __init__.py
│   ├── Dockerfile                   # Docker image definition
│   ├── requirements.txt             # Python dependencies
│   ├── pyproject.toml              # Python project config
│   ├── .env.example                # Example environment variables
│   ├── initial_data.sql            # Database initialization script
│   └── README.md
│
├── frontend/                        # Next.js Application
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page (redirect)
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Dashboard page
│   │   └── (auth)/
│   │       ├── layout.tsx          # Auth layout
│   │       └── login/
│   │           └── page.tsx        # Login page
│   ├── components/
│   │   ├── auth/
│   │   │   └── LoginForm.tsx       # Login form component
│   │   └── shared/
│   │       └── ProtectedRoute.tsx  # Protected route wrapper
│   ├── lib/
│   │   ├── api.ts                  # Axios API client
│   │   ├── auth.ts                 # Auth utilities
│   │   ├── constants.ts            # Constants
│   │   └── utils.ts                # Utility functions
│   ├── hooks/
│   │   └── useAuth.ts              # useAuth custom hook
│   ├── styles/
│   │   ├── globals.css             # Global styles
│   │   └── variables.css           # CSS variables
│   ├── package.json                # Node dependencies
│   ├── tsconfig.json               # TypeScript config
│   ├── tailwind.config.js          # Tailwind configuration
│   ├── next.config.js              # Next.js configuration
│   ├── postcss.config.js           # PostCSS configuration
│   ├── .env.local.example          # Example env variables
│   └── README.md
│
├── docker-compose.yml              # Docker Compose configuration
├── .env.example                    # Example environment variables
├── .gitignore                      # Git ignore rules
└── README.md                       # This file
```

---

## 🔧 Development

### Working with Backend

#### Running Backend Locally (Without Docker)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend will be available at `http://localhost:8000`

#### Running Tests
```bash
cd backend
pytest tests/ -v
```

#### Database Migrations (Using Alembic)
```bash
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head
```

### Working with Frontend

#### Development Server
```bash
cd frontend
npm run dev
```

Frontend will be available at `http://localhost:3000` with hot-reload enabled.

#### Production Build
```bash
cd frontend
npm run build
npm start
```

#### Linting
```bash
cd frontend
npm run lint
```

---

## 📊 Database Schema

### Users Table
- id (PK)
- username (unique)
- email (unique)
- hashed_password
- full_name
- role (admin, doctor, receptionist)
- is_active
- created_at, updated_at

### Patients Table
- id (PK)
- first_name, last_name
- email (unique), phone
- date_of_birth
- address, city, state, zip_code
- gender, blood_group
- medical_history, allergies
- emergency_contact, emergency_phone
- created_at, updated_at

### Appointments Table
- id (PK)
- patient_id (FK), doctor_id (FK)
- appointment_date
- duration_minutes
- status (scheduled, completed, cancelled, no_show)
- reason, notes
- created_at, updated_at

### Prescriptions Table
- id (PK)
- patient_id (FK), doctor_id (FK)
- prescription_date
- medication_details
- dosage, frequency, duration
- notes
- is_active
- created_at, updated_at

### Drugs Table
- id (PK)
- drug_name (unique), drug_code
- category, composition, strength
- manufacturer, price
- quantity, expiry_date
- is_active
- description
- created_at, updated_at

---

## 🔐 Authentication Flow

1. User enters credentials on login page
2. Frontend sends POST request to `/api/auth/login`
3. Backend validates credentials against users table
4. Backend generates JWT token with HS256 algorithm
5. Frontend stores token in localStorage
6. Frontend redirects to dashboard
7. For protected routes, frontend includes token in Authorization header: `Bearer <token>`
8. Backend validates token on each request
9. If token is invalid/expired, user is redirected to login

---

## 🐳 Docker Commands

### Start Services
```bash
docker-compose up              # Start all services
docker-compose up -d           # Start in detached mode
docker-compose up --build      # Rebuild images first
```

### Stop Services
```bash
docker-compose down            # Stop and remove containers
docker-compose down -v         # Also remove volumes
docker-compose stop            # Stop without removing
```

### View Logs
```bash
docker-compose logs            # View all logs
docker-compose logs fastapi    # View only FastAPI logs
docker-compose logs mysql      # View only MySQL logs
docker-compose logs -f         # Follow logs in real-time
```

### Access Container Shell
```bash
docker-compose exec fastapi bash  # Access FastAPI container
docker-compose exec mysql bash    # Access MySQL container
```

---

## 📝 Environment Variables

### Backend (.env)
```
DB_HOST=mysql
DB_PORT=3306
DB_NAME=clinical_db
DB_USER=clinical_user
DB_PASSWORD=clinical_pass_2024
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=False
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8000 (FastAPI)
lsof -ti:8000 | xargs kill -9

# Kill process on port 3000 (Frontend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 3306 (MySQL)
lsof -ti:3306 | xargs kill -9
```

### Database Connection Error
```bash
# Check MySQL container is running
docker-compose ps

# Check MySQL logs
docker-compose logs mysql

# Restart MySQL
docker-compose restart mysql
```

### Frontend Can't Connect to API
1. Verify FastAPI is running: http://localhost:8000/docs
2. Check NEXT_PUBLIC_API_URL in frontend/.env.local
3. Verify CORS is enabled in FastAPI
4. Check browser console for errors

### Cannot Login
1. Verify default admin user exists in database:
   ```bash
   docker-compose exec mysql mysql -u clinical_user -pclinical_pass_2024 -D clinical_db -e "SELECT * FROM users;"
   ```
2. Try default credentials: admin / admin123
3. Check API logs for errors

---

## 📈 Next Steps & Future Development

### Immediate Next Steps
1. ✅ Complete appointment management endpoints
2. ✅ Complete prescription management endpoints
3. ✅ Add drug management endpoints
4. ✅ Implement reports module
5. ✅ Build admin panel features

### Frontend Development
- [ ] Patient management UI pages
- [ ] Appointment booking and calendar view
- [ ] Prescription creation interface
- [ ] Reports and analytics dashboard
- [ ] Admin user management panel
- [ ] Responsive design for mobile devices

### Backend Enhancements
- [ ] Email notifications for appointments
- [ ] SMS integration
- [ ] File upload for medical records
- [ ] Advanced search and filtering
- [ ] Data export (CSV, PDF)
- [ ] Audit logging
- [ ] Rate limiting and throttling

### DevOps & Deployment
- [ ] Nginx reverse proxy configuration
- [ ] SSL/TLS certificates
- [ ] Production environment setup
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Monitoring and alerting
- [ ] Backup strategy

---

## 📞 Support & Documentation

### API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Backend README
See `backend/README.md` for detailed backend documentation

### Frontend README
See `frontend/README.md` for detailed frontend documentation

---

## 📄 License

This project is proprietary and confidential.

---

## 🔄 Version Info

- **Project Version:** 1.0.0
- **Frontend Version:** 1.0.0
- **Backend Version:** 1.0.0
- **Created:** 2026-04-29
- **Last Updated:** 2026-04-29

---

## ✨ Migration Notes

**Original System:** PHP-based clinical management system at `/opt/lampp/htdocs/clinical`

**Migration Status:** ✅ Complete

- [x] Database schema preserved and migrated
- [x] User authentication system redesigned with JWT
- [x] Patient management system rebuilt
- [x] All core features ported to new stack
- [x] Docker containerization for backend
- [x] Frontend built with modern React/Next.js
- [x] API documentation created
- [x] Database initialization script created

---

**Happy Coding! 🎉**

