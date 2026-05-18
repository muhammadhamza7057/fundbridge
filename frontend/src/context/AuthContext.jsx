import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { getGoogleRedirectResult, signInWithGooglePopup, signInWithGoogleRedirect } from '../firebase';

const AuthContext = createContext(null);
const GOOGLE_PENDING_PAYLOAD_KEY = 'fundbridge_google_pending_payload';

function isGoogleRedirectFallbackError(error) {
  const code = String(error?.code || '');
  const message = String(error?.message || '');
  return /popup|redirect|operation-not-supported|cancelled-popup-request|network-request-failed/i.test(code + ' ' + message);
}

function readPendingGooglePayload() {
  try {
    const stored = localStorage.getItem(GOOGLE_PENDING_PAYLOAD_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function writePendingGooglePayload(payload) {
  try {
    localStorage.setItem(GOOGLE_PENDING_PAYLOAD_KEY, JSON.stringify(payload || {}));
  } catch {
    // ignore storage failures
  }
}

function clearPendingGooglePayload() {
  try {
    localStorage.removeItem(GOOGLE_PENDING_PAYLOAD_KEY);
  } catch {
    // ignore storage failures
  }
}

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
    let active = true;

    const finalizeRedirectSignIn = async () => {
      try {
        const result = await getGoogleRedirectResult();
        if (!active || !result?.user) {
          return;
        }

        const idToken = await result.user.getIdToken();
        const pendingPayload = readPendingGooglePayload();
        const { data } = await api.post('/api/auth/firebase', {
          idToken,
          ...pendingPayload,
        });

        clearPendingGooglePayload();
        setToken(data.token);
        setUser(data.user);
      } catch (error) {
        if (error?.code !== 'auth/no-auth-event') {
          console.error('Google redirect sign-in failed:', error);
        }
      }
    };

    finalizeRedirectSignIn();

    return () => {
      active = false;
    };
  }, []);

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
      writePendingGooglePayload(payload);

      try {
        const result = await signInWithGooglePopup();
      const firebaseUser = result.user;
      const idToken = await firebaseUser.getIdToken();

      const { data } = await api.post('/api/auth/firebase', {
        idToken,
        ...payload,
      });
        clearPendingGooglePayload();
      setToken(data.token);
      setUser(data.user);
      return data;
      } catch (error) {
        if (!isGoogleRedirectFallbackError(error)) {
          throw error;
        }

        await signInWithGoogleRedirect();
        return { redirected: true };
      }
    } finally {
      if (!window.location.href.includes('/login') && !window.location.href.includes('/register')) {
        setLoading(false);
      } else {
        setLoading(false);
      }
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