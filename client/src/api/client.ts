import axios from 'axios';
import { store } from '@/store';
import { logout, setCredentials } from '@/store/slices/authSlice';
import { useUIStore } from '@/store/zustand/uiStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token
client.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token refresh
/**
 * Retries failed requests once after refreshing JWT credentials.
 * Falls back to logout if refresh fails or no refresh token is available.
 */
const handleAuthRefresh = async (error: any) => {
  const originalRequest = error.config;

  // Refresh on unauthorized or expired-token responses once per request.
  if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
    originalRequest._retry = true;

    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
      
      const storedUser = localStorage.getItem('authUser');
      const user = store.getState().auth.user ?? (storedUser ? JSON.parse(storedUser) : null);
      if (user) {
        store.dispatch(setCredentials({ user, accessToken: data.accessToken }));
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      // Retry original request
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return client(originalRequest);
    } catch (refreshError) {
      store.dispatch(logout());
      localStorage.removeItem('refreshToken');
      return Promise.reject(refreshError);
    }
  }

  const status = error.response?.status;
  const message =
    error.response?.data?.message ||
    (status ? `Request failed (${status})` : 'Network request failed');

  if (!originalRequest?._toastShown) {
    useUIStore.getState().addToast(message, 'error');
    if (originalRequest) {
      originalRequest._toastShown = true;
    }
  }

  return Promise.reject(error);
};

client.interceptors.response.use(
  (response) => response,
  handleAuthRefresh
);

export default client;
