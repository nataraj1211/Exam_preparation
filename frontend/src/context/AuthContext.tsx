import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { api, getAuthToken, setAuthToken, clearAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    target_exam?: string;
    college_name?: string;
    department?: string;
    phone?: string;
  }) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => Promise<User | void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      const token = getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.getMe();
        setUser(res.user);
      } catch (err) {
        console.warn('Session expired or invalid:', err);
        clearAuthToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await api.login(credentials);
      setAuthToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: {
    name: string;
    email: string;
    password: string;
    target_exam?: string;
    college_name?: string;
    department?: string;
    phone?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await api.register(payload);
      setAuthToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemo = async () => {
    setIsLoading(true);
    try {
      const res = await api.loginDemo();
      setAuthToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
  };

  const updateUser = async (updatedUser: Partial<User>): Promise<User | void> => {
    try {
      const res = await api.updateProfile(updatedUser);
      setUser(res.user);
      return res.user;
    } catch (err) {
      console.warn('Profile sync to server failed, updating local state:', err);
      if (user) {
        const merged = { ...user, ...updatedUser };
        setUser(merged);
        return merged;
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        register,
        loginDemo,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
