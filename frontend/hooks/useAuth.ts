import { useState, useCallback } from 'react';
import { auth, User } from '@/lib/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(auth.getCurrentUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await auth.login(username, password);
      setUser(response.user);
      return response;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    auth.logout();
    setUser(null);
  }, []);

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user || auth.isAuthenticated(),
  };
};
