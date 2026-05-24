import axios, { AxiosInstance } from 'axios';

// Default to deployed backend on Render if env var is not set
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://aarogyadesk-backend.onrender.com/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
