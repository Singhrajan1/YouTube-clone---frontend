import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { getCurrentUser, loginUser, logoutUser, registerUser } from '../api/authApi';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const restore = async () => {
      try {
        const { data } = await getCurrentUser();
        if (isMounted) {
          setUser(data || null);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    restore();

    // Listen for the interceptor's auth:unauthorized event
    const handleUnauthorized = () => {
      if (isMounted) {
        setUser(null);
      }
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      isMounted = false;
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (credentials) => {
    const { data, error } = await loginUser(credentials);
    if (error) return { error };
    setUser(data?.user || data);
    return { error: null };
  };

  const register = async (formData) => {
    const { data, error } = await registerUser(formData);
    if (error) return { error };
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
