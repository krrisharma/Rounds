import React, { useEffect, useState } from "react";
import AppHeader from "../components/AppHeader";
import PatientList from "../components/PatientList";
import WaveformDivider from "../components/WaveformDivider";
import * as api from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { doctor } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .listPatients({ query })
      .then((data) => {
        if (!cancelled) setPatients(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Could not load patients.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <div className="min-h-screen bg-paper">
      <AppHeader />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-1">
          <div>
            <h1 className="text-xl font-semibold text-ink">Good day, {doctor?.name.split(" ")[0]}</h1>
            <p className="text-sm text-muted mt-1">{patients.length} patient{patients.length === 1 ? "" : "s"} under your care</p>
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or MRN…"
            className="w-full sm:w-64 border border-line rounded-md px-3 py-2 text-sm outline-none focus:border-teal bg-surface"
          />
        </div>
        <WaveformDivider className="mb-6 mt-4" />

        {error ? (
          <div className="bg-alert-light border border-alert/30 text-alert text-sm rounded-lg p-4">
            {error}
          </div>
        ) : (
          <PatientList patients={patients} loading={loading} />
        )}
      </main>
    </div>
  );
}
