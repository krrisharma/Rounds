import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [doctor, setDoctor] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('rounds_token'));

  useEffect(() => {
    if (token) {
      setDoctor({ name: 'Dr. Arao' });
    } else {
      setDoctor(null);
    }
  }, [token]);

  const signIn = async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://rounds-api-a4cf.onrender.com'}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });

    if (!res.ok) {
      const err = await res.json().catch(()=>({}));
      throw new Error(err.detail || 'Sign-in failed');
    }
    const data = await res.json();
    localStorage.setItem('rounds_token', data.access_token);
    setToken(data.access_token);
    setDoctor(data.doctor);
  };

  const signOut = () => {
    localStorage.removeItem('rounds_token');
    setToken(null);
    setDoctor(null);
  };

  return (
    <AuthContext.Provider value={{ doctor, isAuthenticated: !!token, signIn, signOut, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
