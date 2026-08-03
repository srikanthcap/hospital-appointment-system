from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import date, time

# --- Authentication & User Schemas ---

class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    role: str  # 'patient', 'doctor', 'admin'

class UserCreate(UserBase):
    password: str
    
    # Extended Patient profile fields
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    address: Optional[str] = None
    
    # Extended Doctor profile fields
    specialization: Optional[str] = None
    experience_years: Optional[int] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int
    full_name: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    user_id: Optional[int] = None

class PatientProfileResponse(BaseModel):
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    address: Optional[str] = None

    class Config:
        from_attributes = True

class DoctorProfileResponse(BaseModel):
    specialization: str
    experience_years: int

    class Config:
        from_attributes = True

class UserResponse(UserBase):
    id: int
    patient_profile: Optional[PatientProfileResponse] = None
    doctor_profile: Optional[DoctorProfileResponse] = None

    class Config:
        from_attributes = True

# --- Doctor Schedule Schemas ---

class DoctorScheduleBase(BaseModel):
    day: date
    start_time: time
    end_time: time

class DoctorScheduleCreate(DoctorScheduleBase):
    pass

class DoctorScheduleResponse(DoctorScheduleBase):
    id: int
    doctor_id: int
    is_booked: bool

    class Config:
        from_attributes = True

# --- Prescription Schemas ---

class PrescriptionBase(BaseModel):
    diagnosis: str
    medicines: str
    notes: Optional[str] = None

class PrescriptionCreate(PrescriptionBase):
    pass

class PrescriptionResponse(PrescriptionBase):
    id: int
    appointment_id: int

    class Config:
        from_attributes = True

# --- Appointment Schemas ---

class AppointmentBase(BaseModel):
    doctor_id: int
    schedule_id: int
    date: date
    time: time
    reason: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentStatusUpdate(BaseModel):
    status: str  # 'pending', 'confirmed', 'completed', 'cancelled'

# Nested user info for Appointment Response
class UserSummary(BaseModel):
    id: int
    full_name: str
    email: str

    class Config:
        from_attributes = True

class PatientSummary(BaseModel):
    id: int
    phone: Optional[str] = None
    user: UserSummary

    class Config:
        from_attributes = True

class DoctorSummary(BaseModel):
    id: int
    specialization: str
    user: UserSummary

    class Config:
        from_attributes = True

class AppointmentResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    schedule_id: int
    date: date
    time: time
    status: str
    reason: Optional[str] = None
    patient: Optional[PatientSummary] = None
    doctor: Optional[DoctorSummary] = None
    prescription: Optional[PrescriptionResponse] = None

    class Config:
        from_attributes = True
