import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)

    # Relationships
    patients = relationship("Patient", back_populates="doctor")


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    mrn = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    admission_date = Column(String, nullable=False)  # Stored as string, e.g., YYYY-MM-DD
    diagnosis = Column(String, nullable=False)
    procedure = Column(String, nullable=True)  # Optional
    allergies = Column(JSON, nullable=False, default=list)  # Stored as JSON list of strings
    status = Column(String, nullable=False)  # pre-op, post-op, discharged
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)

    # Relationships
    doctor = relationship("Doctor", back_populates="patients")
    vitals = relationship("Vitals", back_populates="patient", cascade="all, delete-orphan", passive_deletes=True)
    medications = relationship("Medication", back_populates="patient", cascade="all, delete-orphan", passive_deletes=True)
    discharge_record = relationship("DischargeRecord", uselist=False, back_populates="patient", cascade="all, delete-orphan", passive_deletes=True)


class Vitals(Base):
    __tablename__ = "vitals"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    phase = Column(String, nullable=True)  # pre-op, post-op
    bp_systolic = Column(Integer, nullable=False)
    bp_diastolic = Column(Integer, nullable=False)
    heart_rate = Column(Integer, nullable=False)
    temperature = Column(Float, nullable=False)
    spo2 = Column(Integer, nullable=False)
    pain_score = Column(Integer, nullable=False)  # 0-10
    condition_tag = Column(String, nullable=False)  # Stable, Improving, Deteriorating, Critical
    symptoms = Column(JSON, nullable=False, default=list)  # Stored as JSON list of strings
    notes = Column(String, nullable=True)  # Optional

    # Relationships
    patient = relationship("Patient", back_populates="vitals")


class Medication(Base):
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    dosage = Column(String, nullable=False)
    frequency = Column(String, nullable=False)  # Once, Twice daily, Thrice daily, As needed
    status = Column(String, nullable=False)  # Administered during stay, Discharge prescription

    # Relationships
    patient = relationship("Patient", back_populates="medications")


class DischargeRecord(Base):
    __tablename__ = "discharge_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), unique=True, nullable=False)
    discharge_condition = Column(String, nullable=False)  # Stable, Improved, Requires follow-up, Against medical advice
    follow_up_instructions = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    patient = relationship("Patient", back_populates="discharge_record")
