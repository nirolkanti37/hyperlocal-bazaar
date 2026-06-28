import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, logout as authLogout } from './authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = getCurrentUser((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    const result = await authLogout();
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
    return result;
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.email?.includes('admin') || false,
    logout,
  };
};
