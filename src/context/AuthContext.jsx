import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getCurrentUser, loginUser, logoutUser, registerUser } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: restore session from cookie
  const restoreSession = useCallback(async () => {
    setIsLoading(true);
    const { data } = await getCurrentUser();
    setUser(data || null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    restoreSession();

    // Listen for the interceptor's auth:unauthorized event
    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [restoreSession]);

  const login = async (credentials) => {
    const { data, error } = await loginUser(credentials);
    if (error) return { error };
    // data.user is the logged-in user, data.accessToken etc. are also here
    setUser(data?.user || data);
    return { error: null };
  };

  const register = async (formData) => {
    const { data, error } = await registerUser(formData);
    if (error) return { error };
    // Registration doesn't auto-login; let user login manually
    return { data, error: null };
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const refreshUser = async () => {
    const { data } = await getCurrentUser();
    if (data) setUser(data);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
