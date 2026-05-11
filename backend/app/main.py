from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import (
    setup,
    auth, patients, appointments, treatments, prescriptions, master,
    expenses, medicine, clinics, subscriptions, doctors,
    templates, support, work_done, users, reports,
)

app = FastAPI(
    title="AarogyaDesk Clinical Management API",
    description="API for clinical management system",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://10.123.8.131:3000",
        "http://10.123.8.131:8000",
        "https://aarogyadesk.vercel.app",
        "https://www.aarogyadesk.me",
        "https://aarogyadesk.me",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup endpoint (must be first - creates tables)
app.include_router(setup.router)

# API routers
app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(appointments.router)
app.include_router(treatments.router)
app.include_router(prescriptions.router)
app.include_router(master.router)
app.include_router(expenses.router)
app.include_router(medicine.router)
app.include_router(clinics.router)
app.include_router(subscriptions.router)
app.include_router(doctors.router)
app.include_router(templates.router)
app.include_router(support.router)
app.include_router(work_done.router)
app.include_router(users.router)
app.include_router(reports.router)


@app.get("/")
async def root():
    return {"message": "AarogyaDesk Clinical Management API is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
