 'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, getStoredUser, clearAuth } from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

function normalizeStoredUser(raw: User | null): User | null {
  if (!raw) return null;
  const role = (raw.role as User['role']) ?? 'user';
  return { ...raw, role };
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return normalizeStoredUser(getStoredUser());
  });
  const [isLoading, setIsLoading] = useState(true);

  // Verify token and get user on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const storedUser = getStoredUser();
      if (storedUser) {
        try {
          const response = await authAPI.getCurrentUser();
          const user = response.user as User;
          const role = (user.role as User['role']) ?? 'user';
          setCurrentUser({ ...user, role });
        } catch (error) {
          // Token invalid, clear auth
          clearAuth();
          setCurrentUser(null);
        }
      }
      setIsLoading(false);
    };
    verifyAuth();
  }, []);

  const login = (user: User) => {
    setCurrentUser(user);
  };

  const logout = () => {
    clearAuth();
    setCurrentUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      const user = response.user as User;
      const role = (user.role as User['role']) ?? 'user';
      setCurrentUser({ ...user, role });
    } catch (error) {
      clearAuth();
      setCurrentUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
