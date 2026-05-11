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

export const auth = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });

    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
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

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  },

  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};
