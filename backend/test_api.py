import unittest
import os
import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Setup system path to import app modules
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import Base
from app import models, auth

class TestHospitalAppointmentSystem(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Use an in-memory SQLite database for testing
        cls.engine = create_engine("sqlite:///:memory:")
        cls.Session = sessionmaker(bind=cls.engine)
        Base.metadata.create_all(bind=cls.engine)

    def setUp(self):
        self.db = self.Session()

    def tearDown(self):
        self.db.close()
        # Clean up database entries between tests
        for table in reversed(Base.metadata.sorted_tables):
            self.db.execute(table.delete())
        self.db.commit()

    def test_user_creation_and_hashing(self):
        """Test user creation and password hashing"""
        pw_raw = "mypassword123"
        hashed = auth.get_password_hash(pw_raw)
        
        user = models.User(
            full_name="Dr. Alice",
            email="alice@hospital.com",
            hashed_password=hashed,
            role="doctor"
        )
        self.db.add(user)
        self.db.commit()
        
        db_user = self.db.query(models.User).filter_by(email="alice@hospital.com").first()
        self.assertIsNotNone(db_user)
        self.assertTrue(auth.verify_password(pw_raw, db_user.hashed_password))
        self.assertFalse(auth.verify_password("wrong_password", db_user.hashed_password))

    def test_extended_profiles(self):
        """Test extended patient and doctor profile relations"""
        # Create Patient
        patient_user = models.User(
            full_name="Bob Patient",
            email="bob@patient.com",
            hashed_password="hashed",
            role="patient"
        )
        self.db.add(patient_user)
        self.db.flush()
        
        patient_profile = models.Patient(
            id=patient_user.id,
            phone="1234567890",
            date_of_birth=datetime.date(1995, 5, 20),
            address="123 Main St"
        )
        self.db.add(patient_profile)
        
        # Create Doctor
        doctor_user = models.User(
            full_name="Dr. Smith",
            email="smith@doctor.com",
            hashed_password="hashed",
            role="doctor"
        )
        self.db.add(doctor_user)
        self.db.flush()
        
        doctor_profile = models.Doctor(
            id=doctor_user.id,
            specialization="Cardiology",
            experience_years=12
        )
        self.db.add(doctor_profile)
        self.db.commit()

        # Queries & Assertions
        db_patient = self.db.query(models.Patient).filter_by(phone="1234567890").first()
        self.assertIsNotNone(db_patient)
        self.assertEqual(db_patient.user.full_name, "Bob Patient")

        db_doctor = self.db.query(models.Doctor).filter_by(specialization="Cardiology").first()
        self.assertIsNotNone(db_doctor)
        self.assertEqual(db_doctor.user.full_name, "Dr. Smith")
        self.assertEqual(db_doctor.experience_years, 12)

    def test_appointment_booking_and_conflict_logic(self):
        """Test schedule slots creation and appointment conflict checks"""
        # Create Doctor & Patient
        doctor = models.User(full_name="Dr. House", email="house@doctor.com", hashed_password="pw", role="doctor")
        patient = models.User(full_name="Will", email="will@patient.com", hashed_password="pw", role="patient")
        self.db.add_all([doctor, patient])
        self.db.flush()

        doc_profile = models.Doctor(id=doctor.id, specialization="Diagnostics", experience_years=20)
        pat_profile = models.Patient(id=patient.id, phone="999", date_of_birth=datetime.date(1990, 1, 1), address="City")
        self.db.add_all([doc_profile, pat_profile])
        self.db.flush()

        # Create schedule slots
        day_date = datetime.date(2026, 9, 10)
        time_slot = datetime.time(10, 0, 0)
        slot1 = models.DoctorSchedule(
            doctor_id=doctor.id,
            day=day_date,
            start_time=time_slot,
            end_time=datetime.time(11, 0, 0),
            is_booked=False
        )
        self.db.add(slot1)
        self.db.flush()

        # Book first appointment
        appt1 = models.Appointment(
            patient_id=patient.id,
            doctor_id=doctor.id,
            schedule_id=slot1.id,
            date=day_date,
            time=time_slot,
            status="pending",
            reason="Checkup"
        )
        
        # Verify no conflict initially
        self.assertFalse(appt1.is_slot_conflict(self.db))
        
        # Save appt1 and set slot to booked
        slot1.is_booked = True
        self.db.add(appt1)
        self.db.commit()

        # Create second patient
        patient2 = models.User(full_name="Clara", email="clara@patient.com", hashed_password="pw", role="patient")
        self.db.add(patient2)
        self.db.flush()
        pat2_profile = models.Patient(id=patient2.id, phone="888", date_of_birth=datetime.date(1992, 2, 2), address="Town")
        self.db.add(pat2_profile)
        self.db.flush()

        # Attempt to book second appointment at the same slot/time
        appt2 = models.Appointment(
            patient_id=patient2.id,
            doctor_id=doctor.id,
            schedule_id=slot1.id, # same slot
            date=day_date,
            time=time_slot,
            status="pending",
            reason="Secondary checkup"
        )
        
        # Verify that conflict is detected (slot already booked, same time/doctor)
        self.assertTrue(appt2.is_slot_conflict(self.db))

        # Create a new open slot at the exact same day/time (to simulate backend bypassing checks)
        slot2 = models.DoctorSchedule(
            doctor_id=doctor.id,
            day=day_date,
            start_time=time_slot,
            end_time=datetime.time(11, 0, 0),
            is_booked=False
        )
        self.db.add(slot2)
        self.db.flush()

        appt3 = models.Appointment(
            patient_id=patient2.id,
            doctor_id=doctor.id,
            schedule_id=slot2.id, # new slot, but same doctor and date/time!
            date=day_date,
            time=time_slot,
            status="pending",
            reason="Secondary checkup"
        )

        # Conflict check must STILL return True because doctor is already booked at that date/time
        self.assertTrue(appt3.is_slot_conflict(self.db))

    def test_prescription_linkage(self):
        """Test prescribing and linking to completed appointments"""
        doctor = models.User(full_name="Dr. House", email="house@doctor.com", hashed_password="pw", role="doctor")
        patient = models.User(full_name="Will", email="will@patient.com", hashed_password="pw", role="patient")
        self.db.add_all([doctor, patient])
        self.db.flush()
        doc_profile = models.Doctor(id=doctor.id, specialization="Diagnostics", experience_years=20)
        pat_profile = models.Patient(id=patient.id, phone="999", date_of_birth=datetime.date(1990, 1, 1), address="City")
        self.db.add_all([doc_profile, pat_profile])
        self.db.flush()

        slot = models.DoctorSchedule(
            doctor_id=doctor.id, day=datetime.date(2026, 9, 10),
            start_time=datetime.time(10, 0, 0), end_time=datetime.time(11, 0, 0)
        )
        self.db.add(slot)
        self.db.flush()

        appt = models.Appointment(
            patient_id=patient.id, doctor_id=doctor.id, schedule_id=slot.id,
            date=datetime.date(2026, 9, 10), time=datetime.time(10, 0, 0), status="confirmed"
        )
        self.db.add(appt)
        self.db.flush()

        # Add Prescription
        prescription = models.Prescription(
            appointment_id=appt.id,
            diagnosis="Flu",
            medicines="Aspirin 100mg once daily",
            notes="Rest and stay hydrated."
        )
        self.db.add(prescription)
        appt.status = "completed"
        self.db.commit()

        db_appt = self.db.query(models.Appointment).filter_by(id=appt.id).first()
        self.assertEqual(db_appt.status, "completed")
        self.assertIsNotNone(db_appt.prescription)
        self.assertEqual(db_appt.prescription.diagnosis, "Flu")

if __name__ == "__main__":
    unittest.main()
