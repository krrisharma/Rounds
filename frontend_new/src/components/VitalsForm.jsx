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
            <button key={c} type="button" onClick={() => setReading({...reading, condition_tag: c})} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${reading.condition_tag === c ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'}`}>
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
              <button key={s} type="button" onClick={() => toggleSymptom(s)} className={`px-3 py-1.5 text-sm rounded-full transition-colors font-medium border ${isActive ? 'bg-chart border-chart text-white' : 'bg-paper text-ink border-line hover:border-chart'}`}>
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
