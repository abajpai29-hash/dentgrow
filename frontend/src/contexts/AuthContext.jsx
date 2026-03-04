import { createContext, useContext, useState } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dentgrow_user'));
    } catch {
      return null;
    }
  });

  async function login(email, password) {
    const res = await client.post('/auth/login', { email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('dentgrow_token', token);
    localStorage.setItem('dentgrow_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }

  function logout() {
    localStorage.removeItem('dentgrow_token');
    localStorage.removeItem('dentgrow_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
