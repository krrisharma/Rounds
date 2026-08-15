import pytest
from fastapi.testclient import TestClient
from main import app
import database
import models
from seed import seed_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    seed_db()


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_login_success():
    response = client.post("/auth/login", json={
        "email": "arao@rounds.health",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"].lower() == "bearer"
    assert data["doctor"]["email"] == "arao@rounds.health"

def test_login_failure():
    response = client.post("/auth/login", json={
        "email": "arao@rounds.health",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert "detail" in response.json()

def get_auth_headers():
    response = client.post("/auth/login", json={
        "email": "arao@rounds.health",
        "password": "password123"
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_get_patients():
    headers = get_auth_headers()
    response = client.get("/patients", headers=headers)
    assert response.status_code == 200
    patients = response.json()
    assert len(patients) >= 3
    # Check patient structure
    p = patients[0]
    assert "name" in p
    assert "age" in p
    assert "allergies" in p
    assert "status" in p

def test_get_patients_with_query():
    headers = get_auth_headers()
    # Search for John
    response = client.get("/patients?query=John", headers=headers)
    assert response.status_code == 200
    patients = response.json()
    assert len(patients) >= 1
    assert any("John" in p["name"] for p in patients)

def test_get_patient_by_id():
    headers = get_auth_headers()
    # Get all patients first
    res_all = client.get("/patients", headers=headers)
    patient_id = res_all.json()[0]["id"]
    
    response = client.get(f"/patients/{patient_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["id"] == patient_id

def test_create_patient():
    headers = get_auth_headers()
    payload = {
        "name": "Test Patient",
        "age": 30,
        "gender": "Female",
        "admission_date": "2026-08-15",
        "diagnosis": "Healthy",
        "procedure": "Observation",
        "allergies": ["None"],
        "status": "pre-op"
    }
    response = client.post("/patients", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Patient"
    assert data["status"] == "pre-op"
    assert "id" in data

def test_add_vitals_valid():
    headers = get_auth_headers()
    # Let's add vitals to John Doe (patient 1)
    # We will search for him first
    res_all = client.get("/patients?query=John", headers=headers)
    patient_id = res_all.json()[0]["id"]

    payload = {
        "phase": "post-op",
        "bp_systolic": 120,
        "bp_diastolic": 80,
        "heart_rate": 72,
        "temperature": 37.0,
        "spo2": 98,
        "pain_score": 2,
        "condition_tag": "Stable",
        "symptoms": ["None"],
        "notes": "Feeling good"
    }
    response = client.post(f"/patients/{patient_id}/vitals", json=payload, headers=headers)
    assert response.status_code == 201
    assert response.json()["heart_rate"] == 72

def test_add_vitals_range_invalid():
    headers = get_auth_headers()
    res_all = client.get("/patients?query=John", headers=headers)
    patient_id = res_all.json()[0]["id"]

    # Spo2 out of range (105)
    payload = {
        "phase": "post-op",
        "bp_systolic": 120,
        "bp_diastolic": 80,
        "heart_rate": 72,
        "temperature": 37.0,
        "spo2": 105, # invalid (> 100)
        "pain_score": 2,
        "condition_tag": "Stable",
        "symptoms": ["None"]
    }
    response = client.post(f"/patients/{patient_id}/vitals", json=payload, headers=headers)
    assert response.status_code == 422

    # Heart rate out of range (10)
    payload["spo2"] = 98
    payload["heart_rate"] = 10 # invalid (< 20)
    response = client.post(f"/patients/{patient_id}/vitals", json=payload, headers=headers)
    assert response.status_code == 422

def test_get_vitals():
    headers = get_auth_headers()
    res_all = client.get("/patients?query=John", headers=headers)
    patient_id = res_all.json()[0]["id"]

    response = client.get(f"/patients/{patient_id}/vitals", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) > 0

def test_get_latest_vitals():
    headers = get_auth_headers()
    res_all = client.get("/patients?query=John", headers=headers)
    patient_id = res_all.json()[0]["id"]

    response = client.get(f"/patients/{patient_id}/vitals/latest", headers=headers)
    assert response.status_code == 200
    assert "recorded_at" in response.json()

def test_medication_crud():
    headers = get_auth_headers()
    res_all = client.get("/patients?query=Jane", headers=headers)
    patient_id = res_all.json()[0]["id"]

    # 1. Add medication
    payload = {
        "name": "Amoxicillin",
        "dosage": "500mg",
        "frequency": "Thrice daily",
        "status": "Discharge prescription"
    }
    response = client.post(f"/patients/{patient_id}/medications", json=payload, headers=headers)
    assert response.status_code == 201
    assert response.json()["name"] == "Amoxicillin"

    # 2. Get medications
    response = client.get(f"/patients/{patient_id}/medications", headers=headers)
    assert response.status_code == 200
    meds = response.json()
    assert any(m["name"] == "Amoxicillin" for m in meds)

def test_discharge():
    headers = get_auth_headers()
    res_all = client.get("/patients?query=Robert", headers=headers)
    patient = res_all.json()[0]
    patient_id = patient["id"]

    assert patient["status"] != "discharged"

    # Submit discharge
    payload = {
        "discharge_condition": "Requires follow-up",
        "follow_up_instructions": "Take medication and rest for a week. Visit outpatient clinic next Monday."
    }
    response = client.post(f"/patients/{patient_id}/discharge", json=payload, headers=headers)
    assert response.status_code == 201
    assert response.json()["discharge_condition"] == "Requires follow-up"

    # Check that patient status is now updated to "discharged"
    response_p = client.get(f"/patients/{patient_id}", headers=headers)
    assert response_p.status_code == 200
    assert response_p.json()["status"] == "discharged"
