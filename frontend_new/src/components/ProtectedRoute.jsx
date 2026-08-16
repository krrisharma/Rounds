import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function ProtectedRoute({ children }) {
  const { doctor } = useAuth();
  return doctor ? children : <Navigate to="/login" />;
}
