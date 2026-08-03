import urllib.request
import urllib.parse
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def send_request(path, method="GET", data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
        
    req_data = None
    if data:
        req_data = json.dumps(data).encode("utf-8")
        
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as res:
            return res.status, json.loads(res.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        try:
            err_json = json.loads(err_msg)
            return e.code, err_json
        except Exception:
            return e.code, {"detail": err_msg}

def run_integration_test():
    print("=== STARTING END-TO-END API INTEGRATION TEST ===")
    
    # 1. Register a Doctor
    doc_email = f"dr.house.{int(time.time())}@doctor.com"
    doc_register_data = {
        "full_name": "Dr. House Gregory",
        "email": doc_email,
        "password": "password123",
        "role": "doctor",
        "specialization": "Diagnostics",
        "experience_years": 20
    }
    print(f"\n1. Registering doctor: {doc_email}...")
    status, res = send_request("/auth/register", "POST", doc_register_data)
    assert status == 201, f"Failed doc registration: {res}"
    print("Doctor registered successfully:", res["full_name"])
    
    # 2. Login as Doctor
    print("\n2. Logging in as doctor...")
    status, login_res = send_request("/auth/login", "POST", {
        "email": doc_email,
        "password": "password123"
    })
    assert status == 200, f"Failed login: {login_res}"
    doc_token = login_res["access_token"]
    doc_id = login_res["user_id"]
    print("Doctor logged in successfully. Token generated.")
    
    # 3. Create a Schedule Slot for Doctor
    print("\n3. Creating doctor availability slot...")
    slot_data = {
        "day": "2026-09-15",
        "start_time": "10:00:00",
        "end_time": "11:00:00"
    }
    status, slot_res = send_request("/doctors/schedule", "POST", slot_data, token=doc_token)
    assert status == 201, f"Failed schedule slot creation: {slot_res}"
    slot_id = slot_res["id"]
    print("Availability slot created. Slot ID:", slot_id)
    
    # 4. Register a Patient
    patient_email = f"bob.patient.{int(time.time())}@patient.com"
    patient_register_data = {
        "full_name": "Bob Patient",
        "email": patient_email,
        "password": "password123",
        "role": "patient",
        "phone": "+15551234",
        "date_of_birth": "1995-05-15",
        "address": "123 Health Way"
    }
    print(f"\n4. Registering patient: {patient_email}...")
    status, res = send_request("/auth/register", "POST", patient_register_data)
    assert status == 201, f"Failed patient registration: {res}"
    print("Patient registered successfully:", res["full_name"])
    
    # 5. Login as Patient
    print("\n5. Logging in as patient...")
    status, login_res = send_request("/auth/login", "POST", {
        "email": patient_email,
        "password": "password123"
    })
    assert status == 200, f"Failed login: {login_res}"
    patient_token = login_res["access_token"]
    patient_id = login_res["user_id"]
    print("Patient logged in successfully. Token generated.")
    
    # 6. Query available schedules for this doctor (patient view)
    print(f"\n6. Patient checks availability for doctor {doc_id}...")
    status, schedules = send_request(f"/doctors/{doc_id}/schedule", "GET")
    assert status == 200
    print("Available schedules found:", schedules)
    assert len(schedules) > 0, "No open schedules found"
    
    # 7. Book the appointment (Patient)
    print("\n7. Booking the appointment...")
    booking_data = {
        "doctor_id": doc_id,
        "schedule_id": slot_id,
        "date": "2026-09-15",
        "time": "10:00:00",
        "reason": "Persistent migraine headaches"
    }
    status, appt_res = send_request("/appointments/", "POST", booking_data, token=patient_token)
    assert status == 201, f"Booking failed: {appt_res}"
    appt_id = appt_res["id"]
    print("Appointment booked successfully. Appointment ID:", appt_id)
    
    # 8. Check double booking conflict check (by trying to book same slot again)
    print("\n8. Testing conflict check (double booking)...")
    status, conflict_res = send_request("/appointments/", "POST", booking_data, token=patient_token)
    assert status == 400, "Should have failed double booking with status 400"
    print("Double booking conflict successfully blocked by server:", conflict_res["detail"])
    
    # 9. Doctor updates appointment status to Confirmed
    print("\n9. Doctor confirms the appointment...")
    status, update_res = send_request(f"/appointments/{appt_id}/status", "PATCH", {
        "status": "confirmed"
    }, token=doc_token)
    assert status == 200, f"Status update failed: {update_res}"
    assert update_res["status"] == "confirmed"
    print("Appointment status updated successfully to:", update_res["status"])
    
    # 10. Doctor completes appointment by attaching prescription
    print("\n10. Doctor attaches prescription & completes consultation...")
    presc_data = {
        "diagnosis": "Chronic Migraine",
        "medicines": "Aspirin 500mg daily after breakfast, rest in a dark room.",
        "notes": "Avoid excessive screen time and hydrate regularly."
    }
    status, presc_res = send_request(f"/prescriptions/{appt_id}", "POST", presc_data, token=doc_token)
    assert status == 201, f"Prescription attachment failed: {presc_res}"
    print("Prescription created successfully:", presc_res)
    
    # 11. Patient verifies prescription in their history
    print("\n11. Patient fetches prescription history...")
    status, history_res = send_request(f"/prescriptions/history/{patient_id}", "GET", token=patient_token)
    assert status == 200
    assert len(history_res) > 0, "Prescription history is empty"
    print("Prescription found in history:", history_res[0])
    
    print("\n=== ALL END-TO-END INTEGRATION TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    run_integration_test()
