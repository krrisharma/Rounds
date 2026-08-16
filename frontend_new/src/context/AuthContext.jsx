import React, { createContext, useContext, useState } from 'react';
const AuthContext = createContext();
export function AuthProvider({ children }) {
  const [doctor, setDoctor] = useState({ name: 'Dr. Smith' });
  return <AuthContext.Provider value={{ doctor, login: () => setDoctor({ name: 'Dr. Smith' }) }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
