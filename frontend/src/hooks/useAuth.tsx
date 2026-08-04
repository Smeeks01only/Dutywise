import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface AuthUser {
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (access: string, refresh: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  
  // A robust app would decode the JWT or fetch /api/auth/me here.
  // For this portfolio scope, we extract email from local storage or mock if missing.
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (token) {
      const savedEmail = localStorage.getItem('user_email');
      return { email: savedEmail || 'user@example.com' };
    }
    return null;
  });

  const login = (access: string, refresh: string, email: string) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user_email', email);
    setToken(access);
    setUser({ email });
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_email');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const handleExpired = () => {
      logout();
    };
    window.addEventListener('auth-token-expired', handleExpired);
    return () => window.removeEventListener('auth-token-expired', handleExpired);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
