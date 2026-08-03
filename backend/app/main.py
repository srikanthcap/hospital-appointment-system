from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime

from .database import engine, Base, get_db
from . import models, schemas, auth

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Hospital Appointment System API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Hospital Appointment System API"}

# --- AUTHENTICATION ---

@app.post("/auth/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered."
        )

    # Create new base user
    hashed_pw = auth.get_password_hash(user_in.password)
    new_user = models.User(
        full_name=user_in.full_name,
        email=user_in.email,
        hashed_password=hashed_pw,
        role=user_in.role
    )
    db.add(new_user)
    db.flush()  # to populate new_user.id

    # Create role profiles conceptually
    if user_in.role == "patient":
        patient_profile = models.Patient(
            id=new_user.id,
            phone=user_in.phone,
            date_of_birth=user_in.date_of_birth,
            address=user_in.address
        )
        db.add(patient_profile)
    elif user_in.role == "doctor":
        if not user_in.specialization or user_in.experience_years is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Specialization and Experience Years are required for doctor registration."
            )
        doctor_profile = models.Doctor(
            id=new_user.id,
            specialization=user_in.specialization,
            experience_years=user_in.experience_years
        )
        db.add(doctor_profile)
    elif user_in.role == "admin":
        # Admin does not require an extended profile table row
        pass
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user role. Allowed roles are: patient, doctor, admin"
        )

    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/auth/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    if not user or not auth.verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Return access token with role and metadata
    access_token = auth.create_access_token(data={"email": user.email, "role": user.role, "user_id": user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "full_name": user.full_name
    }

# --- DOCTORS & SCHEDULES ---

@app.get("/doctors/", response_model=List[schemas.UserResponse])
def get_doctors(db: Session = Depends(get_db)):
    # Returns all users with role 'doctor' including their doctor_profile
    doctors = db.query(models.User).filter(models.User.role == "doctor").all()
    return doctors

@app.get("/doctors/{doctor_id}/schedule", response_model=List[schemas.DoctorScheduleResponse])
def get_doctor_schedule(doctor_id: int, only_available: bool = True, db: Session = Depends(get_db)):
    # Verify doctor exists
    doctor = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
        
    query = db.query(models.DoctorSchedule).filter(models.DoctorSchedule.doctor_id == doctor_id)
    if only_available:
        query = query.filter(models.DoctorSchedule.is_booked == False)
    
    return query.all()

@app.post("/doctors/schedule", response_model=schemas.DoctorScheduleResponse, status_code=status.HTTP_201_CREATED)
def add_schedule_slot(
    slot_in: schemas.DoctorScheduleCreate,
    current_user: models.User = Depends(auth.require_role(["doctor"])),
    db: Session = Depends(get_db)
):
    # Verify doctor profile exists for user
    doctor = db.query(models.Doctor).filter(models.Doctor.id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Doctor profile not found for active user.")
        
    # Create the new slot
    new_slot = models.DoctorSchedule(
        doctor_id=current_user.id,
        day=slot_in.day,
        start_time=slot_in.start_time,
        end_time=slot_in.end_time,
        is_booked=False
    )
    db.add(new_slot)
    db.commit()
    db.refresh(new_slot)
    return new_slot

# --- APPOINTMENTS ---

@app.post("/appointments/", response_model=schemas.AppointmentResponse, status_code=status.HTTP_201_CREATED)
def book_appointment(
    appt_in: schemas.AppointmentCreate,
    current_user: models.User = Depends(auth.require_role(["patient"])),
    db: Session = Depends(get_db)
):
    # 1. Fetch the schedule slot
    slot = db.query(models.DoctorSchedule).filter(
        models.DoctorSchedule.id == appt_in.schedule_id,
        models.DoctorSchedule.doctor_id == appt_in.doctor_id
    ).first()
    
    if not slot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor schedule slot not found.")
        
    if slot.is_booked:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This schedule slot has already been booked.")

    # 2. Check patient profile
    patient = db.query(models.Patient).filter(models.Patient.id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Patient profile not found for active user.")

    # 3. Create appointment object and run conflict checks
    new_appt = models.Appointment(
        patient_id=current_user.id,
        doctor_id=appt_in.doctor_id,
        schedule_id=appt_in.schedule_id,
        date=appt_in.date,
        time=appt_in.time,
        status="pending",
        reason=appt_in.reason
    )

    if new_appt.is_slot_conflict(db):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Conflict detected: The doctor is already booked for this time."
        )

    # 4. Save and mark slot as booked
    slot.is_booked = True
    db.add(new_appt)
    db.commit()
    db.refresh(new_appt)
    return new_appt

@app.get("/appointments/my", response_model=List[schemas.AppointmentResponse])
def get_my_appointments(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "patient":
        appointments = db.query(models.Appointment).filter(models.Appointment.patient_id == current_user.id).all()
    elif current_user.role == "doctor":
        appointments = db.query(models.Appointment).filter(models.Appointment.doctor_id == current_user.id).all()
    elif current_user.role == "admin":
        # Admin can view all appointments in the system
        appointments = db.query(models.Appointment).all()
    else:
        appointments = []
    return appointments

@app.patch("/appointments/{id}/status", response_model=schemas.AppointmentResponse)
def update_appointment_status(
    id: int,
    status_update: schemas.AppointmentStatusUpdate,
    current_user: models.User = Depends(auth.require_role(["doctor", "admin"])),
    db: Session = Depends(get_db)
):
    appointment = db.query(models.Appointment).filter(models.Appointment.id == id).first()
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

    new_status = status_update.status.lower()
    if new_status not in ["pending", "confirmed", "completed", "cancelled"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid appointment status value.")

    # Apply role limits: a doctor can only manage appointments assigned to them
    if current_user.role == "doctor" and appointment.doctor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only manage your own appointments.")

    appointment.status = new_status

    # If completed/cancelled, update the slot booking status accordingly
    slot = db.query(models.DoctorSchedule).filter(models.DoctorSchedule.id == appointment.schedule_id).first()
    if slot:
        if new_status == "cancelled":
            slot.is_booked = False
        else:
            # Re-confirm booked if it's reactivated or completed
            slot.is_booked = True

    db.commit()
    db.refresh(appointment)
    return appointment

# --- PRESCRIPTIONS ---

@app.post("/prescriptions/{appointment_id}", response_model=schemas.PrescriptionResponse, status_code=status.HTTP_201_CREATED)
def add_prescription(
    appointment_id: int,
    presc_in: schemas.PrescriptionCreate,
    current_user: models.User = Depends(auth.require_role(["doctor"])),
    db: Session = Depends(get_db)
):
    # Fetch appointment
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

    # Doctor can only prescribe for their own appointments
    if appointment.doctor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only prescribe for your own appointments.")

    # Check if a prescription already exists
    existing = db.query(models.Prescription).filter(models.Prescription.appointment_id == appointment_id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A prescription already exists for this appointment.")

    # Save prescription
    new_presc = models.Prescription(
        appointment_id=appointment_id,
        diagnosis=presc_in.diagnosis,
        medicines=presc_in.medicines,
        notes=presc_in.notes
    )
    db.add(new_presc)
    
    # Auto-complete the appointment on prescription
    appointment.status = "completed"
    
    db.commit()
    db.refresh(new_presc)
    return new_presc

@app.get("/prescriptions/history/{patient_id}", response_model=List[schemas.PrescriptionResponse])
def get_prescription_history(
    patient_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Patient can only view their own history. Doctors and admins can view any patient's history.
    if current_user.role == "patient" and current_user.id != patient_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only access your own prescription history.")

    # Fetch patient profile
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient profile not found.")

    # Fetch all prescriptions linked to appointments for this patient
    prescriptions = db.query(models.Prescription).join(models.Appointment).filter(
        models.Appointment.patient_id == patient_id
    ).all()
    
    return prescriptions

# --- ADMIN USER OVERVIEW (EXTRA ADMIN UI API) ---

class AdminUserSummary(schemas.BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    patient_profile: Optional[schemas.PatientProfileResponse] = None
    doctor_profile: Optional[schemas.DoctorProfileResponse] = None

@app.get("/admin/users", response_model=List[AdminUserSummary])
def admin_get_all_users(
    current_user: models.User = Depends(auth.require_role(["admin"])),
    db: Session = Depends(get_db)
):
    users = db.query(models.User).all()
    return users
