import React from 'react';
export default function PatientHeader({ patient }) {
  return <div className="mb-6"><h1 className="text-2xl font-bold">{patient.name}</h1><p className="text-muted">{patient.mrn} • {patient.age}y {patient.gender}</p><p>{patient.diagnosis} • {patient.status}</p></div>;
}
