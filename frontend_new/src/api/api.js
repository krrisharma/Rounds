let patients = [
  { id: '1', name: 'John Doe', mrn: 'MRN-1234', age: 45, gender: 'M', diagnosis: 'Pneumonia', status: 'admitted', admission_date: '2026-08-10', procedure: '', allergies: [] },
  { id: '2', name: 'Jane Smith', mrn: 'MRN-5678', age: 62, gender: 'F', diagnosis: 'Appendectomy', status: 'post-op', admission_date: '2026-08-12', procedure: 'Appendectomy', allergies: ['Penicillin'] }
];
let vitals = {
  '1': [{ timestamp: '2026-08-14T10:00:00Z', bp_systolic: 120, bp_diastolic: 80, heart_rate: 75, temperature: 98.6, spo2: 99, pain_score: 2, condition_tag: 'Stable', symptoms: ['None'] }],
  '2': [{ timestamp: '2026-08-15T08:00:00Z', bp_systolic: 130, bp_diastolic: 85, heart_rate: 88, temperature: 99.1, spo2: 97, pain_score: 5, condition_tag: 'Improving', symptoms: ['Nausea'] }]
};
let summaries = {};
let medications = {
  '1': [{ id: 'm1', name: 'Amoxicillin', dosage: '500mg', frequency: 'Twice daily', status: 'Administered during stay' }]
};

export const listPatients = async ({ query }) => {
  return new Promise(resolve => setTimeout(() => {
    let res = patients;
    if (query) res = res.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.mrn.includes(query));
    resolve(res);
  }, 300));
};

export const getPatient = async (id) => {
  return new Promise((resolve, reject) => setTimeout(() => {
    const p = patients.find(p => p.id === id);
    p ? resolve(p) : reject(new Error('Patient not found'));
  }, 200));
};

export const createPatient = async (patientData) => {
  return new Promise(resolve => setTimeout(() => {
    const newPatient = { id: String(Date.now()), mrn: 'MRN-' + Math.floor(Math.random()*10000), ...patientData };
    patients.push(newPatient);
    resolve(newPatient);
  }, 300));
};

export const listVitals = async (id) => {
  return new Promise(resolve => setTimeout(() => resolve(vitals[id] || []), 200));
};

export const addVitals = async (id, reading) => {
  return new Promise(resolve => setTimeout(() => {
    if (!vitals[id]) vitals[id] = [];
    const entry = { ...reading, timestamp: new Date().toISOString() };
    vitals[id].push(entry);
    resolve(entry);
  }, 200));
};

export const getSummary = async (id) => {
  return new Promise(resolve => setTimeout(() => resolve(summaries[id] || null), 200));
};

export const generateSummary = async (id) => {
  return new Promise(resolve => setTimeout(() => {
    summaries[id] = { text: 'Draft discharge summary for ' + id, status: 'draft' };
    resolve(summaries[id]);
  }, 1000));
};

export const saveSummary = async (id, text) => {
  return new Promise(resolve => setTimeout(() => {
    summaries[id] = { ...summaries[id], text };
    resolve(summaries[id]);
  }, 200));
};

export const finalizeSummary = async (id) => {
  return new Promise(resolve => setTimeout(() => {
    summaries[id] = { ...summaries[id], status: 'final' };
    resolve(summaries[id]);
  }, 200));
};

export const getMedications = async (id) => {
  return new Promise(resolve => setTimeout(() => resolve(medications[id] || []), 200));
};

export const addMedication = async (id, medData) => {
  return new Promise(resolve => setTimeout(() => {
    if (!medications[id]) medications[id] = [];
    const med = { id: 'm' + Date.now(), ...medData };
    medications[id].push(med);
    resolve(med);
  }, 200));
};

export const submitDischarge = async (id, dischargeData) => {
  return new Promise(resolve => setTimeout(() => {
    const p = patients.find(p => p.id === id);
    if (p) { p.status = 'discharged'; p.dischargeInfo = dischargeData; }
    resolve({ success: true, dischargeData });
  }, 300));
};
