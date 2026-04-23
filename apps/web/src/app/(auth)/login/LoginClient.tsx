"use client";

import { useState, Suspense, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/Logo';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUTM } from '@/hooks/useUTM';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { getGoogleSignInClientId } from '@/lib/api';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (res: { credential: string }) => void;
          }) => void;
          renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const GSI_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { signIn, signInWithGoogle } = useAuth();
  const { data: publicSettings } = useSiteSettings();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useUTM();

  const returnTo = searchParams.get('returnTo') || '/';
  const googleClientId = getGoogleSignInClientId(publicSettings?.google_oauth_client_id);
  const showGoogle = Boolean(googleClientId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(formData.email, formData.password);

      if (error) {
        toast({
          title: 'Erro ao entrar',
          description:
            error.message === 'Invalid login credentials'
              ? 'E-mail ou senha incorretos'
              : error.message,
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: 'Bem-vindo!',
        description: 'Login realizado com sucesso.',
      });

      router.replace(returnTo);
    } catch (err) {
      console.error('Login error:', err);
      toast({
        title: 'Erro ao entrar',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleCredential = useCallback(
    async (credential: string) => {
      setGoogleLoading(true);
      try {
        const { error } = await signInWithGoogle(credential);
        if (error) {
          toast({
            title: 'Erro ao entrar com Google',
            description: error.message,
            variant: 'destructive',
          });
          return;
        }
        toast({
          title: 'Bem-vindo!',
          description: 'Login realizado com sucesso.',
        });
        router.replace(returnTo);
      } finally {
        setGoogleLoading(false);
      }
    },
    [returnTo, router, signInWithGoogle, toast],
  );

  useEffect(() => {
    if (!showGoogle || !googleBtnRef.current) return;

    const el = googleBtnRef.current;

    const init = () => {
      if (!el.isConnected || !window.google?.accounts?.id) return;
      el.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (res: { credential: string }) => {
          void onGoogleCredential(res.credential);
        },
      });
      requestAnimationFrame(() => {
        if (!el.isConnected || !window.google?.accounts?.id) return;
        const w = el.offsetWidth || 320;
        window.google.accounts.id.renderButton(el, {
          theme: 'outline',
          size: 'large',
          width: w,
          text: 'continue_with',
          locale: 'pt-BR',
        });
      });
    };

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GSI_SCRIPT_SRC}"]`,
    );
    if (existing) {
      if (window.google?.accounts?.id) {
        init();
      } else {
        existing.addEventListener('load', init);
        return () => existing.removeEventListener('load', init);
      }
      return;
    }

    const script = document.createElement('script');
    script.src = GSI_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = init;
    document.body.appendChild(script);

    return () => {
      script.removeEventListener('load', init);
    };
  }, [googleClientId, onGoogleCredential, showGoogle]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="p-4 pt-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </header>

      <div className="flex-1 flex flex-col justify-center px-6 pb-12">
        <div className="max-w-sm mx-auto w-full">
          <div className="text-center mb-8">
            <Logo size="lg" className="justify-center mb-6" />
            <h1 className="font-heading text-2xl font-bold mb-2">Bem-vindo de volta</h1>
            <p className="text-muted-foreground">Entre na sua conta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link href="/recuperar-senha" className="text-sm text-primary hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="kairos" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {showGoogle ? (
            <>
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-border" />
                <span className="text-sm text-muted-foreground">ou</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div
                className={`w-full min-h-[44px] flex items-center justify-center [&>div]:w-full ${googleLoading ? 'opacity-60 pointer-events-none' : ''}`}
                ref={googleBtnRef}
              />
              {googleLoading ? (
                <p className="text-center text-sm text-muted-foreground mt-2">Entrando com Google…</p>
              ) : null}
            </>
          ) : null}

          <p className="text-center text-sm text-muted-foreground mt-6">
            Não tem uma conta?{' '}
            <Link href="/cadastro" className="text-primary font-medium hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function LoginClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen text-center flex items-center justify-center p-8">
          Carregando...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
