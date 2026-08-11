import apiClient from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  user_type: string;
  clinic_id?: number;
  status: string;
  login_status?: string;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Session expiry in milliseconds (24 hours)
const SESSION_EXPIRY_TIME = 24 * 60 * 60 * 1000;
const SESSION_TIMESTAMP_KEY = 'session_timestamp';
const TOKEN_KEY = 'access_token'; // stored for Authorization header fallback
const USER_KEY = 'user';

export const auth = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });

    if (response.data.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      localStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString());
    }
    if (response.data.access_token) {
      localStorage.setItem(TOKEN_KEY, response.data.access_token);
    }

    return response.data;
  },

  register: async (
    name: string,
    email: string,
    password: string,
    user_type: 'admin' | 'clinic' = 'clinic',
    clinic_id?: number
  ): Promise<User> => {
    const response = await apiClient.post('/auth/register', {
      name,
      email,
      password,
      user_type,
      ...(clinic_id !== undefined && { clinic_id }),
    });
    return response.data;
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      console.error('Logout error', e);
    }
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SESSION_TIMESTAMP_KEY);
    localStorage.removeItem(TOKEN_KEY);
    window.location.replace('/login');
  },

  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    if (!auth.isAuthenticated()) return null;
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  // Check if session is still valid (not expired)
  isSessionValid: (): boolean => {
    if (typeof window === 'undefined') return false;
    const timestamp = localStorage.getItem(SESSION_TIMESTAMP_KEY);
    if (!timestamp) return false;
    const currentTime = Date.now();
    const sessionTime = parseInt(timestamp, 10);
    return currentTime - sessionTime < SESSION_EXPIRY_TIME;
  },

  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    const hasUser = !!localStorage.getItem(USER_KEY);
    const hasToken = !!localStorage.getItem(TOKEN_KEY);
    if (!hasUser || !hasToken) return false;
    // If session expired, clean up silently without calling logout() (which redirects)
    if (!auth.isSessionValid()) {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(SESSION_TIMESTAMP_KEY);
      localStorage.removeItem(TOKEN_KEY);
      return false;
    }
    return true;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};
