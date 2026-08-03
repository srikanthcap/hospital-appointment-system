from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, Time, Text
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # 'patient', 'doctor', 'admin'

    patient_profile = relationship("Patient", back_populates="user", uselist=False, cascade="all, delete-orphan")
    doctor_profile = relationship("Doctor", back_populates="user", uselist=False, cascade="all, delete-orphan")


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    phone = Column(String, nullable=True)
    date_of_birth = Column(Date, nullable=True)
    address = Column(String, nullable=True)

    user = relationship("User", back_populates="patient_profile")
    appointments = relationship("Appointment", back_populates="patient")


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    specialization = Column(String, nullable=False)
    experience_years = Column(Integer, nullable=False)

    user = relationship("User", back_populates="doctor_profile")
    schedules = relationship("DoctorSchedule", back_populates="doctor", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="doctor")


class DoctorSchedule(Base):
    __tablename__ = "doctor_schedules"

    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    day = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    is_booked = Column(Boolean, default=False)

    doctor = relationship("Doctor", back_populates="schedules")
    appointment = relationship("Appointment", back_populates="schedule", uselist=False)


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    schedule_id = Column(Integer, ForeignKey("doctor_schedules.id"), nullable=False)
    date = Column(Date, nullable=False)
    time = Column(Time, nullable=False)
    status = Column(String, default="pending")  # 'pending', 'confirmed', 'completed', 'cancelled'
    reason = Column(String, nullable=True)

    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")
    schedule = relationship("DoctorSchedule", back_populates="appointment")
    prescription = relationship("Prescription", back_populates="appointment", uselist=False, cascade="all, delete-orphan")

    def is_slot_conflict(self, db) -> bool:
        """
        Check if there are any conflicting active appointments for this doctor at the same date and time.
        Also handles case where the schedule slot itself is already booked.
        """
        # 1. Check if the specific slot is already booked (by another appointment)
        slot = db.query(DoctorSchedule).filter(DoctorSchedule.id == self.schedule_id).first()
        if slot and slot.is_booked:
            # Exclude self if it's already linked to this slot (updating same appointment)
            existing_appt = db.query(Appointment).filter(Appointment.schedule_id == self.schedule_id).first()
            if existing_appt and existing_appt.id != self.id:
                return True

        # 2. Check if the doctor has any other active appointment at the same date & time
        query = db.query(Appointment).filter(
            Appointment.doctor_id == self.doctor_id,
            Appointment.date == self.date,
            Appointment.time == self.time,
            Appointment.status.in_(["pending", "confirmed", "completed"])
        )
        if self.id:
            query = query.filter(Appointment.id != self.id)
        
        return query.first() is not None


class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), unique=True, nullable=False)
    diagnosis = Column(Text, nullable=False)
    medicines = Column(Text, nullable=False)
    notes = Column(Text, nullable=True)

    appointment = relationship("Appointment", back_populates="prescription")
