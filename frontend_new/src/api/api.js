const API_URL = import.meta.env.VITE_API_URL || 'https://rounds-api-a4cf.onrender.com';

const fetchAPI = async (endpoint, options = {}) => {
  const token = localStorage.getItem('rounds_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'API request failed');
  }
  
  return response.json();
};

export const listPatients = async ({ query }) => {
  const qs = query ? `?query=${encodeURIComponent(query)}` : '';
  return fetchAPI(`/patients${qs}`);
};

export const getPatient = async (id) => {
  return fetchAPI(`/patients/${id}`);
};

export const createPatient = async (patientData) => {
  // Generate random MRN if not provided
  if (!patientData.mrn) patientData.mrn = 'MRN-' + Math.floor(Math.random()*10000);
  return fetchAPI(`/patients`, {
    method: 'POST',
    body: JSON.stringify(patientData)
  });
};

export const listVitals = async (id) => {
  return fetchAPI(`/patients/${id}/vitals`);
};

export const addVitals = async (id, reading) => {
  return fetchAPI(`/patients/${id}/vitals`, {
    method: 'POST',
    body: JSON.stringify(reading)
  });
};

export const getSummary = async (id) => {
  // Backend generates it live, we don't store drafts in DB right now
  return null;
};

export const generateSummary = async (id) => {
  return fetchAPI(`/patients/${id}/summary`, {
    method: 'POST'
  });
};

export const saveSummary = async (id, text) => {
  return { text, status: 'draft' };
};

export const finalizeSummary = async (id) => {
  return { status: 'final' };
};

export const getMedications = async (id) => {
  return fetchAPI(`/patients/${id}/medications`);
};

export const addMedication = async (id, medData) => {
  return fetchAPI(`/patients/${id}/medications`, {
    method: 'POST',
    body: JSON.stringify(medData)
  });
};

export const submitDischarge = async (id, dischargeData) => {
  return fetchAPI(`/patients/${id}/discharge`, {
    method: 'POST',
    body: JSON.stringify(dischargeData)
  });
};
