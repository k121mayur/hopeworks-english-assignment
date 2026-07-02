import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [role, setRole] = useState(() => localStorage.getItem('role'));

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { access_token, role: userRole } = data;

    localStorage.setItem('token', access_token);
    localStorage.setItem('role', userRole);
    setToken(access_token);
    setRole(userRole);

    return userRole;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setRole(null);
  }, []);

  const value = useMemo(() => ({ token, role, login, logout }), [token, role, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
