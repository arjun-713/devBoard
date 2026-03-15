import { useSelector, useDispatch } from 'react-redux';
import type { AxiosError } from 'axios';
import type { RootState, AppDispatch } from '@/store';
import { setCredentials, logout as logoutAction, setLoading, setError } from '@/store/slices/authSlice';
import client from '@/api/client';
import { useUIStore } from '@/store/zustand/uiStore';
import { useNavigate } from 'react-router-dom';

interface AuthErrorResponse {
  message?: string;
}

/**
 * Centralized auth hook for login/register/logout and auth session state.
 * Keeps Redux auth state and token persistence synchronized with API auth flows.
 */
export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, accessToken, isAuthenticated, loading, error } = useSelector((state: RootState) => state.auth);

  const login = async (credentials: { email: string; password: string }) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const { data } = await client.post('/auth/login', credentials);
      dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
      localStorage.setItem('refreshToken', data.refreshToken);
      navigate('/');
    } catch (err) {
      const error = err as AxiosError<AuthErrorResponse>;
      dispatch(setError(error.response?.data?.message ?? 'Login failed'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const register = async (userData: { email: string; password: string; name: string }) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const { data } = await client.post('/auth/register', userData);
      dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
      localStorage.setItem('refreshToken', data.refreshToken);
      navigate('/');
    } catch (err) {
      const error = err as AxiosError<AuthErrorResponse>;
      dispatch(setError(error.response?.data?.message ?? 'Registration failed'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const loginDemo = async () => {
    dispatch(setError(null));
    try {
      const { data } = await client.get('/auth/demo');
      dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
      localStorage.setItem('refreshToken', data.refreshToken);
      useUIStore.getState().resetDemoBanner();
      navigate('/dashboard');
    } catch (err) {
      const error = err as AxiosError<AuthErrorResponse>;
      dispatch(setError(error.response?.data?.message ?? 'Demo login failed'));
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await client.post('/auth/logout', { refreshToken });
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      dispatch(logoutAction());
      localStorage.removeItem('refreshToken');
      navigate('/login');
    }
  };

  return {
    user,
    accessToken,
    isAuthenticated,
    loading,
    error,
    login,
    loginDemo,
    register,
    logout
  };
};
