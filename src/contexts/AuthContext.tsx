"use client";

/**
 * Legacy AuthContext - Now uses NextAuth under the hood
 * 
 * This context is maintained for backward compatibility with existing code.
 * For new code, use the useAuth hook from @/lib/auth directly.
 */

import React, { createContext, useContext } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

interface User {
  id: string;
  email: string;
  name: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  
  const user = session?.user ? {
    id: (session.user as any).id || '',
    email: session.user.email || '',
    name: session.user.name || null,
  } : null;

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      return result?.ok || false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    signOut({ callbackUrl: '/' });
  };

  const value: AuthContextType = {
    user,
    isLoading: status === 'loading',
    login,
    logout,
    isAuthenticated: status === 'authenticated',
  };

  return (
    <AuthContext.Provider value={value}>
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
