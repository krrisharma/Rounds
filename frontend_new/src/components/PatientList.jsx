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
          <Link key={p.id} to={`/patient/${p.id}`} className="block bg-surface border border-line p-4 rounded-lg hover:border-teal">
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
