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
  const role = raw.role && String(raw.role).toLowerCase() === 'admin' ? 'admin' : 'user';
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
          const user = response.user;
          const role = user.role && String(user.role).toLowerCase() === 'admin' ? 'admin' : 'user';
          setCurrentUser({
            name: user.name,
            photoURL: user.photoURL,
            role,
            _id: user._id,
            email: user.email,
            balance: user.balance,
          });
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
      const user = response.user;
      const role = user.role && String(user.role).toLowerCase() === 'admin' ? 'admin' : 'user';
      setCurrentUser({
        name: user.name,
        photoURL: user.photoURL,
        role,
        _id: user._id,
        email: user.email,
        balance: user.balance,
      });
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
