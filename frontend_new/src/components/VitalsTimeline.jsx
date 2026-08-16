import React from 'react';
export default function VitalsTimeline({ vitals }) {
  if (!vitals.length) return <div className="text-muted text-sm mt-4">No vitals recorded yet.</div>;
  return <div className="mt-4 space-y-3">{vitals.map((v, i) => <div key={i} className="p-3 border border-line rounded-lg bg-surface text-sm">BP: {v.bp_systolic}/{v.bp_diastolic} HR: {v.heart_rate} Temp: {v.temperature} SpO2: {v.spo2} Pain: {v.pain_score} <br/> Cond: {v.condition_tag} Sym: {v.symptoms?.join(', ')}</div>)}</div>;
}
