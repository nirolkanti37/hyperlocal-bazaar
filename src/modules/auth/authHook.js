import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, logout as authLogout, getUserData } from './authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = getCurrentUser(async (firebaseUser) => {
      setUser(firebaseUser);
      
      // Check admin status from Firestore instead of email
      if (firebaseUser) {
        try {
          const userData = await getUserData(firebaseUser.uid);
          if (userData.success && userData.data?.isAdmin === true) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      
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
    setIsAdmin(false);
    setLoading(false);
    return result;
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin,
    logout,
  };
};
