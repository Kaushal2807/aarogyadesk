import axios, { AxiosInstance } from 'axios';

// Default to deployed backend on Render if env var is not set
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://aarogyadesk-backend.onrender.com/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // send cookies when same-site
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Bearer token for cross-origin requests
// (HttpOnly cookies won't work cross-origin with SameSite restrictions)
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('session_timestamp');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
