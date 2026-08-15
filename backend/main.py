import os
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import database
import models
import schemas
import auth

# Initialize the database tables if they do not exist
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="Rounds Backend API",
    description="Backend API for Rounds - patient monitoring and discharge workflows.",
    version="1.0.0"
)

# CORS Configuration
frontend_origin = os.getenv("FRONTEND_ORIGIN", "*")
if frontend_origin == "*":
    origins = ["*"]
    allow_credentials = False
else:
    origins = [origin.strip() for origin in frontend_origin.split(",") if origin.strip()]
    allow_credentials = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Public Health Check Route
@app.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    return {"status": "healthy"}

# Public Login Route
class LoginPayload(schemas.BaseModel):
    email: str
    password: str

@app.post("/auth/login", response_model=schemas.Token)
def login(payload: LoginPayload, db: Session = Depends(database.get_db)):
    doctor = db.query(models.Doctor).filter(models.Doctor.email == payload.email).first()
    if not doctor or not auth.verify_password(payload.password, doctor.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(data={"sub": doctor.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "doctor": doctor
    }

# Protected Patient Routes
@app.post("/patients", response_model=schemas.PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(
    payload: schemas.PatientCreate,
    db: Session = Depends(database.get_db),
    current_doctor: models.Doctor = Depends(auth.get_current_doctor)
):
    db_patient = models.Patient(
        name=payload.name,
        age=payload.age,
        gender=payload.gender,
        admission_date=payload.admission_date,
        diagnosis=payload.diagnosis,
        procedure=payload.procedure,
        allergies=payload.allergies,
        status=payload.status,
        doctor_id=current_doctor.id
    )
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

@app.get("/patients", response_model=List[schemas.PatientResponse])
def get_patients(
    query: Optional[str] = None,
    db: Session = Depends(database.get_db),
    current_doctor: models.Doctor = Depends(auth.get_current_doctor)
):
    # Only list patients for the logged-in doctor
    db_query = db.query(models.Patient).filter(models.Patient.doctor_id == current_doctor.id)
    if query:
        search = f"%{query}%"
        db_query = db_query.filter(
            (models.Patient.name.like(search)) | 
            (models.Patient.diagnosis.like(search))
        )
    return db_query.all()

@app.get("/patients/{id}", response_model=schemas.PatientResponse)
def get_patient(
    id: int,
    db: Session = Depends(database.get_db),
    current_doctor: models.Doctor = Depends(auth.get_current_doctor)
):
    patient = db.query(models.Patient).filter(
        models.Patient.id == id,
        models.Patient.doctor_id == current_doctor.id
    ).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    return patient

# Protected Vitals Routes
@app.post("/patients/{id}/vitals", response_model=schemas.VitalsResponse, status_code=status.HTTP_201_CREATED)
def add_vitals(
    id: int,
    payload: schemas.VitalsCreate,
    db: Session = Depends(database.get_db),
    current_doctor: models.Doctor = Depends(auth.get_current_doctor)
):
    patient = db.query(models.Patient).filter(
        models.Patient.id == id,
        models.Patient.doctor_id == current_doctor.id
    ).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    db_vitals = models.Vitals(
        patient_id=id,
        phase=payload.phase,
        bp_systolic=payload.bp_systolic,
        bp_diastolic=payload.bp_diastolic,
        heart_rate=payload.heart_rate,
        temperature=payload.temperature,
        spo2=payload.spo2,
        pain_score=payload.pain_score,
        condition_tag=payload.condition_tag,
        symptoms=payload.symptoms,
        notes=payload.notes
    )
    db.add(db_vitals)
    db.commit()
    db.refresh(db_vitals)
    return db_vitals

@app.get("/patients/{id}/vitals", response_model=List[schemas.VitalsResponse])
def get_vitals(
    id: int,
    db: Session = Depends(database.get_db),
    current_doctor: models.Doctor = Depends(auth.get_current_doctor)
):
    patient = db.query(models.Patient).filter(
        models.Patient.id == id,
        models.Patient.doctor_id == current_doctor.id
    ).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    return patient.vitals

@app.get("/patients/{id}/vitals/latest", response_model=schemas.VitalsResponse)
def get_latest_vitals(
    id: int,
    db: Session = Depends(database.get_db),
    current_doctor: models.Doctor = Depends(auth.get_current_doctor)
):
    patient = db.query(models.Patient).filter(
        models.Patient.id == id,
        models.Patient.doctor_id == current_doctor.id
    ).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    latest_vitals = db.query(models.Vitals).filter(
        models.Vitals.patient_id == id
    ).order_by(models.Vitals.recorded_at.desc(), models.Vitals.id.desc()).first()
    
    if not latest_vitals:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No vitals recorded for this patient"
        )
    return latest_vitals

# Protected Medications Routes
@app.post("/patients/{id}/medications", response_model=schemas.MedicationResponse, status_code=status.HTTP_201_CREATED)
def add_medication(
    id: int,
    payload: schemas.MedicationCreate,
    db: Session = Depends(database.get_db),
    current_doctor: models.Doctor = Depends(auth.get_current_doctor)
):
    patient = db.query(models.Patient).filter(
        models.Patient.id == id,
        models.Patient.doctor_id == current_doctor.id
    ).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    db_med = models.Medication(
        patient_id=id,
        name=payload.name,
        dosage=payload.dosage,
        frequency=payload.frequency,
        status=payload.status
    )
    db.add(db_med)
    db.commit()
    db.refresh(db_med)
    return db_med

@app.get("/patients/{id}/medications", response_model=List[schemas.MedicationResponse])
def get_medications(
    id: int,
    db: Session = Depends(database.get_db),
    current_doctor: models.Doctor = Depends(auth.get_current_doctor)
):
    patient = db.query(models.Patient).filter(
        models.Patient.id == id,
        models.Patient.doctor_id == current_doctor.id
    ).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    return patient.medications

# Protected Discharge Routes
@app.post("/patients/{id}/discharge", response_model=schemas.DischargeRecordResponse, status_code=status.HTTP_201_CREATED)
def submit_discharge(
    id: int,
    payload: schemas.DischargeRecordCreate,
    db: Session = Depends(database.get_db),
    current_doctor: models.Doctor = Depends(auth.get_current_doctor)
):
    patient = db.query(models.Patient).filter(
        models.Patient.id == id,
        models.Patient.doctor_id == current_doctor.id
    ).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Save discharge record
    # Check if a discharge record already exists for this patient, if so overwrite or update it
    discharge_record = db.query(models.DischargeRecord).filter(
        models.DischargeRecord.patient_id == id
    ).first()
    
    if discharge_record:
        discharge_record.discharge_condition = payload.discharge_condition
        discharge_record.follow_up_instructions = payload.follow_up_instructions
        discharge_record.created_at = models.datetime.datetime.utcnow()
    else:
        discharge_record = models.DischargeRecord(
            patient_id=id,
            discharge_condition=payload.discharge_condition,
            follow_up_instructions=payload.follow_up_instructions
        )
        db.add(discharge_record)
    
    # Update patient status to "discharged"
    patient.status = "discharged"
    
    db.commit()
    db.refresh(discharge_record)
    return discharge_record
