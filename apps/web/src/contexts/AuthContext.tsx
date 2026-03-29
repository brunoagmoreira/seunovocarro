"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  city: string | null;
  state: string | null;
}

export type UserRole = 'user' | 'editor' | 'admin';
export type UserStatus = 'pending' | 'active' | 'suspended';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  userRole: UserRole;
  userStatus: UserStatus;
  isLoading: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  isApproved: boolean;
  token: string | null;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: Error | null }>;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  profile: null,
  userRole: 'user',
  userStatus: 'active',
  isLoading: true,
  isAdmin: false,
  isEditor: false,
  isApproved: true,
  token: null,
  signUp: async () => ({ error: new Error('AuthProvider not mounted') }),
  signIn: async () => ({ error: new Error('AuthProvider not mounted') }),
  signOut: async () => {},
  updateProfile: async () => ({ error: new Error('AuthProvider not mounted') }),
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [userStatus, setUserStatus] = useState<UserStatus>('active');
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    // 1. Initial Load: Check token
    const storedToken = localStorage.getItem('kairos_auth_token');
    
    if (storedToken) {
      setToken(storedToken);
      fetchMe(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchMe = async (authToken: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!res.ok) {
        throw new Error('Token inválido ou expirado');
      }

      const data = await res.json();
      
      setUser({ id: data.id, email: data.email });
      setUserRole(data.role as UserRole);
      setUserStatus(data.status as UserStatus);
      
      // Mapear dados do usuário para o 'profile' simulando o objeto antigo
      setProfile({
        id: data.id,
        full_name: data.full_name,
        avatar_url: data.avatar_url,
        phone: data.phone,
        whatsapp: data.whatsapp,
        city: data.city,
        state: data.state
      });
      
    } catch (err) {
      console.warn('Falha na autenticação via JWT:', err);
      signOut();
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, ...metadata }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Falha ao registrar');
      }

      const data = await res.json();
      
      if (data.access_token) {
        localStorage.setItem('kairos_auth_token', data.access_token);
        setToken(data.access_token);
        await fetchMe(data.access_token);
      }
      
      return { error: null };
    } catch (error: any) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error('Email ou senha incorretos');
      }

      const data = await res.json();
      
      if (data.access_token) {
        localStorage.setItem('kairos_auth_token', data.access_token);
        setToken(data.access_token);
        await fetchMe(data.access_token);
      }
      
      return { error: null };
    } catch (error: any) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('kairos_auth_token');
    setToken(null);
    setUser(null);
    setProfile(null);
    setUserRole('user');
    setUserStatus('active');
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!token) return { error: new Error('Not authenticated') };

    try {
      const res = await fetch(`${API_URL}/users/profile`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Falha ao atualizar perfil');

      const updated = await res.json();
      setProfile(prev => prev ? { ...prev, ...updated } : updated);

      return { error: null };
    } catch (error: any) {
      return { error: error as Error };
    }
  };

  const isAdmin = userRole === 'admin';
  const isEditor = userRole === 'editor' || userRole === 'admin';
  const isApproved = userStatus === 'active';

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      userRole,
      userStatus,
      isLoading,
      isAdmin,
      isEditor,
      isApproved,
      token,
      signUp,
      signIn,
      signOut,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
