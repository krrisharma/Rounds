import React, { useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("arao@rounds.health");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    const dest = location.state?.from?.pathname || "/dashboard";
    return <Navigate to={dest} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Sign-in failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <svg viewBox="0 0 32 32" width="44" height="44" aria-hidden="true" className="mb-3">
            <rect width="32" height="32" rx="7" fill="#0B6E6E" />
            <path
              d="M4 17 L10 17 L12.5 9 L16.5 24 L19 17 L22 17 L24 13 L28 13"
              stroke="#E4F1F0"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h1 className="text-lg font-semibold text-ink">Rounds</h1>
          <p className="text-xs text-muted font-data mt-1">Doctor portal</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-line rounded-lg p-6 shadow-card">
          <label className="block mb-4">
            <span className="text-xs text-muted">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full border border-line rounded-md px-3 py-2 text-sm outline-none focus:border-teal font-data"
              autoComplete="username"
            />
          </label>
          <label className="block mb-2">
            <span className="text-xs text-muted">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full border border-line rounded-md px-3 py-2 text-sm outline-none focus:border-teal font-data"
              autoComplete="current-password"
            />
          </label>

          {error && <p className="text-alert text-sm mt-3">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 w-full bg-teal hover:bg-teal-dark disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-md transition-colors"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-xs text-muted mt-4 font-data">
          Prototype build — demo credentials are pre-filled.
        </p>
      </div>
    </div>
  );
}
