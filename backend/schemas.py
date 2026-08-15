from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal
from datetime import datetime

# Doctor Schemas
class DoctorBase(BaseModel):
    name: str
    email: str

class DoctorCreate(DoctorBase):
    password: str

class DoctorResponse(DoctorBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    doctor: DoctorResponse

class TokenData(BaseModel):
    email: Optional[str] = None

# Medication Schemas
class MedicationBase(BaseModel):
    name: str
    dosage: str
    frequency: Literal["Once", "Twice daily", "Thrice daily", "As needed"]
    status: Literal["Administered during stay", "Discharge prescription"]

class MedicationCreate(MedicationBase):
    pass

class MedicationResponse(MedicationBase):
    id: int
    patient_id: int

    model_config = ConfigDict(from_attributes=True)

# Vitals Schemas
class VitalsBase(BaseModel):
    phase: Literal["pre-op", "post-op"]
    bp_systolic: int
    bp_diastolic: int
    heart_rate: int = Field(..., ge=20, le=250)
    temperature: float = Field(..., ge=30.0, le=45.0)
    spo2: int = Field(..., ge=0, le=100)
    pain_score: int = Field(..., ge=0, le=10)
    condition_tag: Literal["Stable", "Improving", "Deteriorating", "Critical"]
    symptoms: List[Literal["Fever", "Nausea", "Dizziness", "Bleeding", "Swelling", "None"]]
    notes: Optional[str] = None

class VitalsCreate(VitalsBase):
    pass

class VitalsResponse(VitalsBase):
    id: int
    patient_id: int
    recorded_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Discharge Record Schemas
class DischargeRecordBase(BaseModel):
    discharge_condition: Literal["Stable", "Improved", "Requires follow-up", "Against medical advice"]
    follow_up_instructions: str

class DischargeRecordCreate(DischargeRecordBase):
    pass

class DischargeRecordResponse(DischargeRecordBase):
    id: int
    patient_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Patient Schemas
class PatientBase(BaseModel):
    name: str
    age: int
    gender: str
    admission_date: str
    diagnosis: str
    procedure: Optional[str] = None
    allergies: List[str] = Field(default_factory=list)
    status: Literal["pre-op", "post-op", "discharged"]

class PatientCreate(PatientBase):
    pass

class PatientResponse(PatientBase):
    id: int
    doctor_id: int
    medications: List[MedicationResponse] = []
    vitals: List[VitalsResponse] = []
    discharge_record: Optional[DischargeRecordResponse] = None

    model_config = ConfigDict(from_attributes=True)
