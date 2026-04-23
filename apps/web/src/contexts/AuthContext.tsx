"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { formatApiNetworkError, getPublicApiUrl } from '@/lib/api';

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
  [key: string]: any;
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
  signInWithGoogle: (idToken: string) => Promise<{ error: Error | null }>;
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
  signInWithGoogle: async () => ({ error: new Error('AuthProvider not mounted') }),
  signOut: async () => {},
  updateProfile: async () => ({ error: new Error('AuthProvider not mounted') }),
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

const API_URL = getPublicApiUrl();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [userStatus, setUserStatus] = useState<UserStatus>('active');
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // 1. Initial Load: Check token
    const storedToken = localStorage.getItem('snc_auth_token');
    
    if (storedToken) {
      setToken(storedToken);
      fetchMe(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchMe = async (authToken: string) => {
    const url = `${API_URL}/users/profile`;
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!res.ok) {
        throw new Error('Token inválido ou expirado');
      }

      const data = await res.json();
      
      setUser({ id: data.id, email: data.email });
      setUserRole(data.role as UserRole);
      setUserStatus(data.status as UserStatus);
      
      setProfile(data);
      
    } catch (err) {
      console.warn('Falha na autenticação via JWT:', err);
      if (err instanceof TypeError || (err instanceof Error && err.message.toLowerCase().includes('fetch'))) {
        console.warn('URL do perfil:', url);
      }
      signOut();
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    const url = `${API_URL}/auth/register`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, ...metadata }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error((errorData as { message?: string }).message || 'Falha ao registrar');
      }

      const data = await res.json();
      
      if (data.access_token) {
        localStorage.setItem('snc_auth_token', data.access_token);
        setToken(data.access_token);
        await fetchMe(data.access_token);
      }
      
      return { error: null };
    } catch (error: any) {
      return { error: formatApiNetworkError(error, url) };
    }
  };

  const signIn = async (email: string, password: string) => {
    const url = `${API_URL}/auth/login`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const msg =
          (errJson as { message?: string }).message ||
          (res.status === 401 ? 'E-mail ou senha incorretos' : `Erro ${res.status} ao entrar`);
        throw new Error(msg);
      }

      const data = await res.json();
      
      if (data.access_token) {
        localStorage.setItem('snc_auth_token', data.access_token);
        setToken(data.access_token);
        await fetchMe(data.access_token);
      }
      
      return { error: null };
    } catch (error: any) {
      return { error: formatApiNetworkError(error, url) };
    }
  };

  const signInWithGoogle = useCallback(async (idToken: string) => {
    const url = `${API_URL}/auth/google`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        let message = 'Não foi possível entrar com Google';
        try {
          const err = await res.json();
          message = (err as { message?: string }).message || message;
        } catch {
          /* ignore */
        }
        throw new Error(message);
      }

      const data = await res.json();

      if (data.access_token) {
        localStorage.setItem('snc_auth_token', data.access_token);
        setToken(data.access_token);
        await fetchMe(data.access_token);
      }

      return { error: null };
    } catch (error: any) {
      return { error: formatApiNetworkError(error, url) };
    }
  }, []);

  const signOut = async () => {
    localStorage.removeItem('snc_auth_token');
    setToken(null);
    setUser(null);
    setProfile(null);
    setUserRole('user');
    setUserStatus('active');
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!token) return { error: new Error('Not authenticated') };

    const url = `${API_URL}/users/profile`;
    try {
      const res = await fetch(url, {
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
      return { error: formatApiNetworkError(error, url) };
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
      signInWithGoogle,
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
