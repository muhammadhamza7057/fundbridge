import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { setAuthToken } = useAuth();
  const { search } = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const token = params.get('token');
    if (token) {
      setAuthToken(token).then(() => navigate('/dashboard', { replace: true }));
    } else {
      navigate('/login', { replace: true });
    }
  }, [search, setAuthToken, navigate]);

  return null;
}
