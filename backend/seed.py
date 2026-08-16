import datetime
from database import SessionLocal, engine
import models
import auth

def seed_db():
    print("Recreating database tables...")
    models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 1. Create Demo Doctor
        print("Seeding doctor...")
        hashed_password = auth.get_password_hash("password123")
        doc = models.Doctor(
            name="Arao Rao",
            email="arao@rounds.health",
            password_hash=hashed_password
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)

        # 2. Create Patients
        print("Seeding patients...")
        # Patient 1: John Doe (Stable post-op)
        p1 = models.Patient(
            mrn="MRN-1234",
            name="John Doe",
            age=45,
            gender="Male",
            admission_date="2026-08-10",
            diagnosis="Acute Appendicitis",
            procedure="Laparoscopic Appendectomy",
            allergies=["Penicillin"],
            status="post-op",
            doctor_id=doc.id
        )
        # Patient 2: Jane Smith (Improving pre-op)
        p2 = models.Patient(
            mrn="MRN-5678",
            name="Jane Smith",
            age=62,
            gender="Female",
            admission_date="2026-08-11",
            diagnosis="Cholecystitis",
            procedure=None,
            allergies=["Peanuts", "Other: Latex"],
            status="pre-op",
            doctor_id=doc.id
        )
        # Patient 3: Robert Johnson (Deteriorating post-op)
        p3 = models.Patient(
            mrn="MRN-9012",
            name="Robert Johnson",
            age=78,
            gender="Male",
            admission_date="2026-08-12",
            diagnosis="Severe Pneumonia",
            procedure="Bronchoscopy",
            allergies=[],
            status="post-op",
            doctor_id=doc.id
        )
        # Patient 4: Emily Davis (Discharged)
        p4 = models.Patient(
            mrn="MRN-3456",
            name="Emily Davis",
            age=29,
            gender="Female",
            admission_date="2026-08-08",
            diagnosis="Anterior Cruciate Ligament Tear",
            procedure="ACL Reconstruction",
            allergies=["Sulfa drugs"],
            status="discharged",
            doctor_id=doc.id
        )

        db.add_all([p1, p2, p3, p4])
        db.commit()
        for p in [p1, p2, p3, p4]:
            db.refresh(p)

        # 3. Create Vitals
        print("Seeding vitals...")
        base_time = datetime.datetime.utcnow() - datetime.timedelta(days=2)

        # Patient 1: John Doe (Stable trend, 6 readings)
        p1_vitals = []
        for i in range(6):
            recorded_at = base_time + datetime.timedelta(hours=i * 8)
            p1_vitals.append(models.Vitals(
                patient_id=p1.id,
                timestamp=recorded_at,
                phase="post-op",
                bp_systolic=120 + (i % 3),
                bp_diastolic=80 - (i % 2),
                heart_rate=72 + (i % 4),
                temperature=36.7 + (0.1 * (i % 3)),
                spo2=98 + (i % 2),
                pain_score=3 - (i // 2),  # pain going down
                condition_tag="Stable",
                symptoms=["None"] if i > 2 else ["Nausea"],
                notes=f"Patient is doing well. Recovering post-op. Check {i+1}."
            ))
        
        # Patient 2: Jane Smith (Improving trend, 6 readings)
        p2_vitals = []
        for i in range(6):
            recorded_at = base_time + datetime.timedelta(hours=i * 6)
            p2_vitals.append(models.Vitals(
                patient_id=p2.id,
                timestamp=recorded_at,
                phase="pre-op",
                bp_systolic=135 - (i * 2),
                bp_diastolic=85 - (i % 2),
                heart_rate=88 - (i * 2),  # heart rate improving
                temperature=37.8 - (0.2 * i),  # temp returning to normal
                spo2=95 + (i // 2),  # oxygen improving
                pain_score=6 - i,  # pain resolving
                condition_tag="Improving" if i > 0 else "Stable",
                symptoms=["None"] if i > 3 else ["Fever", "Nausea"],
                notes=f"Pre-op preparation in progress. Vitals improving. Check {i+1}."
            ))

        # Patient 3: Robert Johnson (Deteriorating trend, 7 readings)
        p3_vitals = []
        # HR rising, temp rising, spo2 dropping, pain rising, tag deteriorating/critical
        deteriorating_data = [
            # BP_sys, BP_dia, HR, Temp, SpO2, Pain, Tag, Symptoms
            (120, 80, 72, 36.8, 97, 2, "Stable", ["None"]),
            (122, 81, 78, 37.1, 96, 3, "Stable", ["None"]),
            (125, 83, 85, 37.5, 95, 4, "Stable", ["Fever"]),
            (128, 85, 96, 38.2, 93, 5, "Deteriorating", ["Fever"]),
            (132, 88, 108, 38.9, 91, 7, "Deteriorating", ["Fever", "Dizziness"]),
            (138, 92, 118, 39.4, 88, 8, "Critical", ["Fever", "Dizziness", "Nausea"]),
            (145, 96, 126, 39.9, 85, 10, "Critical", ["Fever", "Dizziness", "Nausea", "Bleeding"])
        ]
        for i, data in enumerate(deteriorating_data):
            recorded_at = base_time + datetime.timedelta(hours=i * 6)
            p3_vitals.append(models.Vitals(
                patient_id=p3.id,
                timestamp=recorded_at,
                phase="post-op",
                bp_systolic=data[0],
                bp_diastolic=data[1],
                heart_rate=data[2],
                temperature=data[3],
                spo2=data[4],
                pain_score=data[5],
                condition_tag=data[6],
                symptoms=data[7],
                notes=f"Routine check {i+1}. Noticing worrisome signs."
            ))

        # Patient 4: Emily Davis (Stable vitals, 5 readings)
        p4_vitals = []
        for i in range(5):
            recorded_at = base_time + datetime.timedelta(hours=i * 12)
            p4_vitals.append(models.Vitals(
                patient_id=p4.id,
                timestamp=recorded_at,
                phase="post-op",
                bp_systolic=118 + (i % 2),
                bp_diastolic=78,
                heart_rate=68,
                temperature=36.6,
                spo2=99,
                pain_score=1,
                condition_tag="Stable",
                symptoms=["None"],
                notes="Recovered completely. Ready for discharge."
            ))

        db.add_all(p1_vitals + p2_vitals + p3_vitals + p4_vitals)
        db.commit()

        # 4. Create Medications
        print("Seeding medications...")
        # Patient 1 medications
        meds1 = [
            models.Medication(patient_id=p1.id, name="Acetaminophen", dosage="500mg", frequency="Twice daily", status="Administered during stay"),
            models.Medication(patient_id=p1.id, name="Cephalexin", dosage="250mg", frequency="Thrice daily", status="Discharge prescription"),
            models.Medication(patient_id=p1.id, name="Ibuprofen", dosage="400mg", frequency="As needed", status="Administered during stay")
        ]
        # Patient 2 medications
        meds2 = [
            models.Medication(patient_id=p2.id, name="Metronidazole", dosage="500mg", frequency="Thrice daily", status="Administered during stay"),
            models.Medication(patient_id=p2.id, name="Ciprofloxacin", dosage="400mg", frequency="Twice daily", status="Administered during stay")
        ]
        # Patient 3 medications
        meds3 = [
            models.Medication(patient_id=p3.id, name="Levofloxacin", dosage="750mg", frequency="Once", status="Administered during stay"),
            models.Medication(patient_id=p3.id, name="Albuterol Inhaler", dosage="2 puffs", frequency="As needed", status="Administered during stay")
        ]
        # Patient 4 medications
        meds4 = [
            models.Medication(patient_id=p4.id, name="Oxycodone", dosage="5mg", frequency="Once", status="Administered during stay"),
            models.Medication(patient_id=p4.id, name="Naproxen", dosage="500mg", frequency="Twice daily", status="Discharge prescription")
        ]
        db.add_all(meds1 + meds2 + meds3 + meds4)
        db.commit()

        # 5. Create Discharge Record for Patient 4 (Emily Davis)
        print("Seeding discharge record...")
        discharge_rec = models.DischargeRecord(
            patient_id=p4.id,
            discharge_condition="Improved",
            follow_up_instructions="Keep leg elevated when sitting. Wear knee brace at all times except during physical therapy. Avoid weight-bearing activities. Follow up in clinic in 2 weeks."
        )
        db.add(discharge_rec)
        db.commit()

        print("Database seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
