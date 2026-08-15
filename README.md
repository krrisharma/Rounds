# Rounds — Doctor Portal (Frontend)

A frontend-only prototype matching the 4-screen spec: login, patient dashboard,
patient detail (vitals + timeline), and discharge summary generation.

## Run it

```bash
npm install
npm run dev
```

Open the printed localhost URL. Demo login is pre-filled:
- Email: `arao@rounds.health`
- Password: `password123`

## What's real vs. mocked

Everything in `src/api/api.js` is currently an **in-memory mock** with
artificial network delay, so the whole app is fully clickable right now —
no backend required. Seeded with 4 sample patients and vitals history.

When the real backend is ready, edit **only `src/api/api.js`**: swap each
function's body for a real `fetch(...)` call against your API. Nothing in
`pages/` or `components/` needs to change, since they only ever import from
this one file.

The `generateSummary(patientId)` function is the one that should eventually
call your LLM endpoint — right now it fabricates a plausible discharge
summary from the patient's vitals after a simulated 2.2s delay, which is
what the loading state on `/patient/:id/summary` is built against.

## Stack

- React + Vite (no TypeScript, per the 1.5-day timeline)
- React Router for the 4 routes
- Tailwind CSS for styling
- Recharts for the vitals chart
- React Context for auth session only — everything else is local state

## Structure

```
src/
 ├─ api/api.js         # every network call — swap mocks for fetch() here
 ├─ context/            # AuthContext (doctor session)
 ├─ components/         # reusable UI: cards, forms, headers, editor
 ├─ pages/              # LoginPage, DashboardPage, PatientDetailPage, SummaryPage
 └─ App.jsx             # routes + ProtectedRoute wiring
```

## Design notes

Palette and type are deliberately clinical rather than generic-AI-demo:
deep teal (`#0B6E6E`) + cool paper background, IBM Plex Mono for all vitals/
data readouts (evokes a bedside monitor), IBM Plex Sans for body text. The
waveform motif in the header logo and section dividers is the one recurring
signature element, tying back to "vitals monitoring" without being
decorative. A persistent teal confidentiality banner reinforces the
patient-privacy pitch on every authenticated screen.
