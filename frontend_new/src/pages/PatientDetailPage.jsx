import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import PatientHeader from "../components/PatientHeader";
import VitalsForm from "../components/VitalsForm";
import VitalsTimeline from "../components/VitalsTimeline";
import WaveformDivider from "../components/WaveformDivider";
import * as api from "../api/api";

export default function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [vitals, setVitals] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([api.getPatient(id), api.listVitals(id), api.getMedications(id)])
      .then(([p, v, m]) => {
        if (cancelled) return;
        setPatient(p);
        setVitals(v);
        setMedications(m);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Could not load this patient.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleAddVitals(reading) {
    const entry = await api.addVitals(id, reading);
    setVitals((v) => [...v, entry]);
  }

  async function handleAddMedication(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const medData = {
      name: formData.get("name"),
      dosage: formData.get("dosage"),
      frequency: formData.get("frequency"),
      status: formData.get("status")
    };
    const entry = await api.addMedication(id, medData);
    setMedications(m => [...m, entry]);
    e.target.reset();
  }

  async function handleDischarge(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const dischargeData = {
      discharge_condition: formData.get("discharge_condition"),
      follow_up_instructions: formData.get("follow_up_instructions")
    };
    await api.submitDischarge(id, dischargeData);
    navigate(`/patient/${id}/summary`);
  }

  if (error) {
    return (
      <div className="min-h-screen bg-paper">
        <AppHeader />
        <main className="max-w-3xl mx-auto px-6 py-10">
          <div className="bg-alert-light border border-alert/30 text-alert text-sm rounded-lg p-4">{error}</div>
          <Link to="/dashboard" className="text-sm text-teal mt-4 inline-block">← Back to dashboard</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <AppHeader />
      <main className="max-w-3xl mx-auto px-6 py-8">
        <Link to="/dashboard" className="text-sm text-muted hover:text-ink mb-4 inline-block">← Dashboard</Link>

        {loading || !patient ? (
          <div className="h-28 rounded-lg bg-surface border border-line animate-pulse" />
        ) : (
          <>
            <PatientHeader patient={patient} />

            <div className="flex items-center justify-between mt-6 mb-2">
              <h2 className="text-sm font-semibold text-ink">Discharge summary</h2>
              <button
                onClick={() => navigate(`/patient/${id}/summary`)}
                className="bg-chart hover:bg-chart/90 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
              >
                Generate discharge summary
              </button>
            </div>
            <WaveformDivider className="mb-6" />

            <div className="space-y-5">
              <VitalsForm onSubmit={handleAddVitals} />
              <VitalsTimeline vitals={vitals} loading={false} />
            </div>

            <div className="mt-8">
              <h2 className="text-sm font-semibold text-ink mb-4">Medications</h2>
              <WaveformDivider className="mb-4" />
              
              <form onSubmit={handleAddMedication} className="bg-surface p-4 border border-line rounded-lg mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs text-muted mb-1">Name</label>
                    <input name="name" required list="meds" className="w-full border border-line bg-paper rounded p-2 text-sm focus:border-teal outline-none" />
                    <datalist id="meds"><option value="Amoxicillin" /><option value="Ibuprofen" /><option value="Acetaminophen" /></datalist>
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Dosage</label>
                    <input name="dosage" required placeholder="e.g. 500mg" className="w-full border border-line bg-paper rounded p-2 text-sm focus:border-teal outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Frequency</label>
                    <select name="frequency" required className="w-full border border-line bg-paper rounded p-2 text-sm focus:border-teal outline-none">
                      <option>Once</option><option>Twice daily</option><option>Thrice daily</option><option>As needed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Status</label>
                    <select name="status" required className="w-full border border-line bg-paper rounded p-2 text-sm focus:border-teal outline-none">
                      <option>Administered during stay</option><option>Discharge prescription</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="bg-teal text-white px-4 py-2 rounded text-sm font-medium hover:bg-teal-dark">Add Medication</button>
              </form>

              <div className="space-y-2">
                {medications.length === 0 ? <p className="text-sm text-muted">No medications added.</p> : medications.map(m => (
                  <div key={m.id} className="p-3 border border-line rounded-lg bg-surface text-sm flex justify-between items-center">
                    <div><strong className="text-ink">{m.name}</strong> {m.dosage}</div>
                    <div className="text-muted text-right text-xs">{m.frequency} <br/> <span className="bg-paper px-2 py-0.5 rounded border border-line mt-1 inline-block">{m.status}</span></div>
                  </div>
                ))}
              </div>
            </div>

            {patient.status === 'post-op' && (
              <div className="mt-8">
                <h2 className="text-sm font-semibold text-ink mb-4">Discharge</h2>
                <WaveformDivider className="mb-4" />
                <form onSubmit={handleDischarge} className="bg-surface p-4 border border-line rounded-lg">
                  <div className="mb-4">
                    <label className="block text-xs text-muted mb-1">Discharge Condition</label>
                    <select name="discharge_condition" required className="w-full border border-line bg-paper rounded p-2 text-sm focus:border-teal outline-none">
                      <option>Stable</option><option>Improved</option><option>Requires follow-up</option><option>Against medical advice</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs text-muted mb-1">Follow-up Instructions</label>
                    <textarea name="follow_up_instructions" required className="w-full border border-line bg-paper rounded p-2 text-sm focus:border-teal outline-none" rows="3"></textarea>
                  </div>
                  <button type="submit" className="bg-chart text-white px-4 py-2 rounded text-sm font-medium hover:bg-chart/90">Submit Discharge & Generate Summary</button>
                </form>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
