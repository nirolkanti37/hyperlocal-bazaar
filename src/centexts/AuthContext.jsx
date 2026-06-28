import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange, getUserData, logout } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsAuthenticated(true);

        try {
          const data = await getUserData(firebaseUser.uid);
          setUserData(data);
        } catch (err) {
          console.error('Error fetching user data:', err);
        }
      } else {
        setUser(null);
        setUserData(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (firebaseUser) => {
    setUser(firebaseUser);
    setIsAuthenticated(true);

    try {
      const data = await getUserData(firebaseUser.uid);
      setUserData(data);
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setUserData(null);
      setIsAuthenticated(false);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const updateUserData = (newData) => {
    setUserData(prev => ({ ...prev, ...newData }));
  };

  const value = {
    user,
    userData,
    loading,
    error,
    isAuthenticated,
    login,
    logout: handleLogout,
    updateUserData,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
