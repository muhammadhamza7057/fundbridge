import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { signInWithGooglePopup } from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('fundbridge_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('fundbridge_token') || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('fundbridge_token', token);
    } else {
      localStorage.removeItem('fundbridge_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('fundbridge_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('fundbridge_user');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      setToken(data.token);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/register', payload);
      setToken(data.token);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
  };

  const signInWithGoogle = async (payload = {}) => {
    setLoading(true);
    try {
      const result = await signInWithGooglePopup();
      const firebaseUser = result.user;
      const idToken = await firebaseUser.getIdToken();

      const { data } = await api.post('/api/auth/firebase', {
        idToken,
        ...payload,
      });
      setToken(data.token);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (nextUser) => {
    setUser(nextUser);
  };

  const setAuthToken = async (newToken) => {
    if (!newToken) return;
    setToken(newToken);
    try {
      const { data } = await api.get('/api/auth/me');
      setUser(data.user || null);
    } catch (err) {
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, updateUser, setAuthToken, signInWithGoogle, isAuthenticated: Boolean(token) }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}