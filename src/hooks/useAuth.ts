import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from './useApi';
import { useAuthStore } from '../store/auth';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    admissionNumber: string;
    role: 'admin' | 'user';
  };
}

export const useAuth = () => {
  const api = useApi();
  const navigate = useNavigate();
  const { login: setAuth, logout: clearAuth } = useAuthStore();

  const login = useCallback(async (admissionNumber: string, password: string, purpose: string) => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        admissionNumber,
        password,
        purpose,
      });
      setAuth(response.user, response.token);
      navigate(response.user.role === 'admin' ? '/admin' : '/user');
    } catch (error) {
      throw new Error('Invalid credentials');
    }
  }, [api, setAuth, navigate]);

  const logout = useCallback(() => {
    clearAuth();
    navigate('/login');
  }, [clearAuth, navigate]);

  return { login, logout };
};