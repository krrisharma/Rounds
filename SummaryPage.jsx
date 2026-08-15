import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import SummaryEditor from "../components/SummaryEditor";
import WaveformDivider from "../components/WaveformDivider";
import * as api from "../api/api";

function SummaryLoadingState() {
  return (
    <div className="bg-surface border border-line rounded-lg p-10 flex flex-col items-center text-center shadow-card">
      <svg viewBox="0 0 40 40" width="40" height="40" className="mb-4 text-teal">
        <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="4" />
        <path d="M20 4 a16 16 0 0 1 16 16" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="0.9s" repeatCount="indefinite" />
        </path>
      </svg>
      <p className="text-sm font-medium text-ink">Generating discharge summary…</p>
      <p className="text-xs text-muted mt-1 font-data">Reviewing chart and vitals — this can take a few seconds.</p>
    </div>
  );
}

export default function SummaryPage() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [summary, setSummary] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoadingPage(true);
    Promise.all([api.getPatient(id), api.getSummary(id)])
      .then(async ([p, existing]) => {
        if (cancelled) return;
        setPatient(p);
        if (existing) {
          setSummary(existing);
        } else {
          setLoadingPage(false);
          setGenerating(true);
          try {
            const generated = await api.generateSummary(id);
            if (!cancelled) setSummary(generated);
          } catch (err) {
            if (!cancelled) setError(err.message || "Could not generate summary.");
          } finally {
            if (!cancelled) setGenerating(false);
          }
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Could not load this patient.");
      })
      .finally(() => {
        if (!cancelled) setLoadingPage(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleRegenerate() {
    setGenerating(true);
    setError(null);
    try {
      const generated = await api.generateSummary(id);
      setSummary(generated);
    } catch (err) {
      setError(err.message || "Could not regenerate summary.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave(text) {
    const saved = await api.saveSummary(id, text);
    setSummary(saved);
  }

  async function handleFinalize() {
    const finalized = await api.finalizeSummary(id);
    setSummary(finalized);
  }

  return (
    <div className="min-h-screen bg-paper">
      <AppHeader />
      <main className="max-w-3xl mx-auto px-6 py-8">
        <Link to={`/patient/${id}`} className="text-sm text-muted hover:text-ink mb-4 inline-block">← Back to patient</Link>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
          <div>
            <h1 className="text-xl font-semibold text-ink">Discharge summary</h1>
            {patient && <p className="text-sm text-muted mt-1">{patient.name} · {patient.mrn}</p>}
          </div>
          {summary && !generating && summary.status !== "final" && (
            <button
              onClick={handleRegenerate}
              className="text-sm text-teal hover:text-teal-dark font-medium"
            >
              Regenerate ↻
            </button>
          )}
        </div>
        <WaveformDivider className="mb-6 mt-4" />

        {error && (
          <div className="bg-alert-light border border-alert/30 text-alert text-sm rounded-lg p-4 mb-5">{error}</div>
        )}

        {loadingPage ? (
          <div className="h-64 rounded-lg bg-surface border border-line animate-pulse" />
        ) : generating ? (
          <SummaryLoadingState />
        ) : summary ? (
          <SummaryEditor text={summary.text} status={summary.status} onSave={handleSave} onFinalize={handleFinalize} />
        ) : null}
      </main>
    </div>
  );
}
