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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([api.getPatient(id), api.listVitals(id)])
      .then(([p, v]) => {
        if (cancelled) return;
        setPatient(p);
        setVitals(v);
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
          </>
        )}
      </main>
    </div>
  );
}
