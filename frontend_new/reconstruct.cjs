const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const files = {
  'api/api.js': `
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
`,
  'context/AuthContext.jsx': `
import React, { createContext, useContext, useState } from 'react';
const AuthContext = createContext();
export function AuthProvider({ children }) {
  const [doctor, setDoctor] = useState({ name: 'Dr. Smith' });
  return <AuthContext.Provider value={{ doctor, login: () => setDoctor({ name: 'Dr. Smith' }) }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
`,
  'components/AppHeader.jsx': `
import React from 'react';
import { Link } from 'react-router-dom';
export default function AppHeader() {
  return <header className="bg-surface border-b border-line px-6 py-4 flex items-center justify-between"><Link to="/" className="text-xl font-bold text-teal">Rounds</Link></header>;
}
`,
  'components/WaveformDivider.jsx': `
import React from 'react';
export default function WaveformDivider({ className = '' }) {
  return <div className={\`h-1 bg-line rounded \${className}\`}></div>;
}
`,
  'components/ProtectedRoute.jsx': `
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function ProtectedRoute({ children }) {
  const { doctor } = useAuth();
  return doctor ? children : <Navigate to="/login" />;
}
`,
  'components/PatientList.jsx': `
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api/api';
export default function PatientList({ patients, loading }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', age: '', gender: '', diagnosis: '', admission_date: '', status: 'admitted', procedure: '', allergies: [] });
  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.createPatient(formData);
    setShowModal(false);
    window.location.reload();
  };

  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Patients</h2>
        <button onClick={() => setShowModal(true)} className="bg-teal text-white px-3 py-1 rounded hover:bg-teal-dark transition-colors text-sm font-medium">Add Patient</button>
      </div>
      <div className="space-y-3">
        {patients.map(p => (
          <Link key={p.id} to={\`/patient/\${p.id}\`} className="block bg-surface border border-line p-4 rounded-lg hover:border-teal">
            <div className="font-medium text-ink">{p.name} <span className="text-sm text-muted">({p.mrn})</span></div>
            <div className="text-sm text-muted">{p.diagnosis} • {p.status}</div>
          </Link>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">New Patient</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required placeholder="Name" className="w-full border p-2 rounded" onChange={e => setFormData({...formData, name: e.target.value})} />
              <input required placeholder="Age" type="number" className="w-full border p-2 rounded" onChange={e => setFormData({...formData, age: parseInt(e.target.value)})} />
              <input required placeholder="Gender" className="w-full border p-2 rounded" onChange={e => setFormData({...formData, gender: e.target.value})} />
              <input required placeholder="Diagnosis" className="w-full border p-2 rounded" onChange={e => setFormData({...formData, diagnosis: e.target.value})} />
              <input required type="date" className="w-full border p-2 rounded" onChange={e => setFormData({...formData, admission_date: e.target.value})} />
              
              {/* NEW FIELDS */}
              <label className="block text-sm font-medium mt-2">Procedure (Optional)</label>
              <input placeholder="Search or enter procedure" list="procedures" className="w-full border p-2 rounded" onChange={e => setFormData({...formData, procedure: e.target.value})} />
              <datalist id="procedures"><option value="Appendectomy" /><option value="Knee Replacement" /><option value="CABG" /></datalist>
              
              <label className="block text-sm font-medium mt-2">Allergies</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {['Penicillin', 'Latex', 'Sulfa', 'Peanuts', 'None'].map(a => (
                  <label key={a} className="flex items-center gap-1 bg-paper border border-line px-2 py-1 rounded-full text-sm">
                    <input type="checkbox" checked={formData.allergies.includes(a)} onChange={e => {
                      if (e.target.checked) setFormData({...formData, allergies: [...formData.allergies, a]});
                      else setFormData({...formData, allergies: formData.allergies.filter(x => x !== a)});
                    }}/> {a}
                  </label>
                ))}
              </div>
              <input placeholder="Other Allergies (comma separated)" className="w-full border p-2 rounded text-sm" onChange={e => {
                const other = e.target.value;
                setFormData(prev => ({...prev, allergies: prev.allergies.filter(a => ['Penicillin', 'Latex', 'Sulfa', 'Peanuts', 'None'].includes(a)).concat(other ? [other] : [])}));
              }} />

              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-teal text-white rounded hover:bg-teal-dark">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
`,
  'components/PatientHeader.jsx': `
import React from 'react';
export default function PatientHeader({ patient }) {
  return <div className="mb-6"><h1 className="text-2xl font-bold">{patient.name}</h1><p className="text-muted">{patient.mrn} • {patient.age}y {patient.gender}</p><p>{patient.diagnosis} • {patient.status}</p></div>;
}
`,
  'components/VitalsTimeline.jsx': `
import React from 'react';
export default function VitalsTimeline({ vitals }) {
  if (!vitals.length) return <div className="text-muted text-sm mt-4">No vitals recorded yet.</div>;
  return <div className="mt-4 space-y-3">{vitals.map((v, i) => <div key={i} className="p-3 border border-line rounded-lg bg-surface text-sm">BP: {v.bp_systolic}/{v.bp_diastolic} HR: {v.heart_rate} Temp: {v.temperature} SpO2: {v.spo2} Pain: {v.pain_score} <br/> Cond: {v.condition_tag} Sym: {v.symptoms?.join(', ')}</div>)}</div>;
}
`,
  'components/SummaryEditor.jsx': `
import React, { useState } from 'react';
export default function SummaryEditor({ text, status, onSave, onFinalize }) {
  const [val, setVal] = useState(text);
  return <div><textarea className="w-full h-64 border border-line p-3 rounded mb-4 focus:border-teal outline-none" value={val} onChange={e => setVal(e.target.value)} disabled={status === 'final'} /><div className="flex gap-3"><button onClick={() => onSave(val)} disabled={status === 'final'} className="px-4 py-2 bg-paper border border-line rounded">Save Draft</button><button onClick={onFinalize} disabled={status === 'final'} className="px-4 py-2 bg-chart text-white rounded">Finalize</button></div></div>;
}
`,
  'components/VitalsForm.jsx': `
import React, { useState } from 'react';

export default function VitalsForm({ onSubmit }) {
  const [reading, setReading] = useState({
    bp_systolic: '', bp_diastolic: '', heart_rate: '', temperature: '', spo2: '', pain_score: '', notes: '',
    condition_tag: 'Stable', symptoms: []
  });

  const conditions = ['Stable', 'Improving', 'Deteriorating', 'Critical'];
  const symptomList = ['Fever', 'Nausea', 'Dizziness', 'Bleeding', 'Swelling', 'None'];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(reading);
    setReading({ bp_systolic: '', bp_diastolic: '', heart_rate: '', temperature: '', spo2: '', pain_score: '', notes: '', condition_tag: 'Stable', symptoms: [] });
  };

  const toggleSymptom = (sym) => {
    setReading(prev => {
      let nextSym = prev.symptoms;
      if (sym === 'None') {
        nextSym = nextSym.includes('None') ? [] : ['None'];
      } else {
        nextSym = nextSym.filter(s => s !== 'None');
        if (nextSym.includes(sym)) nextSym = nextSym.filter(s => s !== sym);
        else nextSym = [...nextSym, sym];
      }
      return { ...prev, symptoms: nextSym };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface p-5 border border-line rounded-lg">
      <h3 className="text-sm font-semibold mb-4 text-ink">Record Vitals</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-xs text-muted mb-1">BP Systolic</label>
          <input type="number" required className="w-full border border-line bg-paper focus:border-teal outline-none rounded p-2 text-sm" value={reading.bp_systolic} onChange={e => setReading({...reading, bp_systolic: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">BP Diastolic</label>
          <input type="number" required className="w-full border border-line bg-paper focus:border-teal outline-none rounded p-2 text-sm" value={reading.bp_diastolic} onChange={e => setReading({...reading, bp_diastolic: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Heart Rate</label>
          <input type="number" required className="w-full border border-line bg-paper focus:border-teal outline-none rounded p-2 text-sm" value={reading.heart_rate} onChange={e => setReading({...reading, heart_rate: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Temp (F)</label>
          <input type="number" step="0.1" required className="w-full border border-line bg-paper focus:border-teal outline-none rounded p-2 text-sm" value={reading.temperature} onChange={e => setReading({...reading, temperature: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">SpO2 (%)</label>
          <input type="number" required className="w-full border border-line bg-paper focus:border-teal outline-none rounded p-2 text-sm" value={reading.spo2} onChange={e => setReading({...reading, spo2: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Pain (0-10)</label>
          <input type="number" required min="0" max="10" className="w-full border border-line bg-paper focus:border-teal outline-none rounded p-2 text-sm" value={reading.pain_score} onChange={e => setReading({...reading, pain_score: e.target.value})} />
        </div>
      </div>
      
      {/* NEW: Condition Tag */}
      <div className="mb-5">
        <label className="block text-xs text-muted mb-2">Condition</label>
        <div className="flex gap-2 bg-paper p-1 rounded-lg border border-line w-fit">
          {conditions.map(c => (
            <button key={c} type="button" onClick={() => setReading({...reading, condition_tag: c})} className={\`px-4 py-1.5 text-sm font-medium rounded-md transition-colors \${reading.condition_tag === c ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'}\`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* NEW: Symptoms */}
      <div className="mb-5">
        <label className="block text-xs text-muted mb-2">Symptoms (Select all that apply)</label>
        <div className="flex flex-wrap gap-2">
          {symptomList.map(s => {
            const isActive = reading.symptoms.includes(s);
            return (
              <button key={s} type="button" onClick={() => toggleSymptom(s)} className={\`px-3 py-1.5 text-sm rounded-full transition-colors font-medium border \${isActive ? 'bg-chart border-chart text-white' : 'bg-paper text-ink border-line hover:border-chart'}\`}>
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs text-muted mb-1">Notes (Optional)</label>
        <textarea className="w-full border border-line bg-paper focus:border-teal outline-none rounded p-2 text-sm" rows="2" value={reading.notes} onChange={e => setReading({...reading, notes: e.target.value})} />
      </div>
      
      <button type="submit" className="w-full bg-teal hover:bg-teal-dark text-white font-medium py-2 rounded transition-colors">Save Vitals</button>
    </form>
  );
}
`
};

for (const [relPath, content] of Object.entries(files)) {
  const fullPath = path.join(srcDir, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\\n', 'utf8');
}
console.log("Successfully created mock files.");
