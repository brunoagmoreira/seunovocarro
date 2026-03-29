"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/Logo';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUTM, getStoredUTM } from '@/hooks/useUTM';
import { trackSignUp, trackLead } from '@/lib/tracking';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { STATES } from '@/types/vehicle';
import { useCities } from '@/hooks/useCities';

const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { signUp } = useAuth();
  
  const returnTo = searchParams.get('returnTo');
  const actionParam = searchParams.get('action');
  const vehicleIdParam = searchParams.get('vehicleId');
  const vehicleNameParam = searchParams.get('vehicleName');
  const sellerWhatsappParam = searchParams.get('sellerWhatsapp');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sellerType, setSellerType] = useState<'none' | 'seller' | 'dealer'>('none');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    password: '',
    confirmPassword: '',
    dealerName: ''
  });

  useUTM();

  const { cities, isLoading: citiesLoading } = useCities(formData.state);

  useEffect(() => {
    setFormData(prev => ({ ...prev, city: '' }));
  }, [formData.state]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  const handleWhatsAppRedirect = async (userName: string, userEmail: string, userPhone: string) => {
    if (!vehicleIdParam || !sellerWhatsappParam) return;

    try {
      const utmParams = getStoredUTM();

      // TODO: Replace with NestJS API call to create Lead record
      // await fetch('/api/leads', { method: 'POST', body: JSON.stringify({...}) })

      const message = encodeURIComponent(
        `Olá! Sou ${userName} e vi o ${vehicleNameParam} no Seu Novo Carro. Gostaria de mais informações!`
      );
      const cleanPhone = sellerWhatsappParam.replace(/\D/g, '');
      window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
    } catch (error) {
      console.error('Error creating lead for WhatsApp:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    const isDealer = sellerType === 'dealer';
    const isSeller = sellerType === 'seller' || sellerType === 'dealer';

    const { error } = await signUp(formData.email, formData.password, {
      full_name: formData.name,
      phone: formData.phone,
      city: formData.city,
      state: formData.state,
      role: isSeller ? 'editor' : 'user',
      is_dealer: isDealer,
      dealer_name: isDealer ? formData.dealerName : undefined,
    });

    if (error) {
      toast({
        title: "Erro ao criar conta",
        description: error.message,
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    trackSignUp('email', isSeller ? 'editor' : 'user');

    if (actionParam === 'whatsapp') {
      await handleWhatsAppRedirect(formData.name, formData.email, formData.phone);
      
      if (vehicleIdParam) {
        trackLead('whatsapp', {
          vehicleId: vehicleIdParam,
          vehicleName: vehicleNameParam || '',
        });
      }
    }

    setIsLoading(false);
    
    toast({
      title: "Conta criada com sucesso! 🎉",
      description: "Você já está logado.",
    });
    
    router.replace(returnTo || '/');
  };

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
            <h1 className="font-heading text-2xl font-bold mb-2">Criar conta</h1>
            <p className="text-muted-foreground">Preencha os dados para se cadastrar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

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
              <Label htmlFor="phone">Telefone / WhatsApp</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={formData.phone}
                onChange={handlePhoneChange}
                maxLength={15}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Select
                  value={formData.state}
                  onValueChange={(v) => setFormData({ ...formData, state: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATES.map(state => (
                      <SelectItem key={state.uf} value={state.uf}>{state.uf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Select
                  value={formData.city}
                  onValueChange={(v) => setFormData({ ...formData, city: v })}
                  disabled={!formData.state || citiesLoading}
                >
                  <SelectTrigger>
                    {citiesLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <SelectValue placeholder="Selecione" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map(city => (
                      <SelectItem key={city.id} value={city.nome}>{city.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <div className="space-y-3 py-2">
              <Label className="text-sm text-muted-foreground">Tipo de conta</Label>
              
              <div className="space-y-2">
                <label 
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    sellerType === 'none' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="sellerType"
                    value="none"
                    checked={sellerType === 'none'}
                    onChange={() => setSellerType('none')}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    sellerType === 'none' ? 'border-primary' : 'border-muted-foreground'
                  }`}>
                    {sellerType === 'none' && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div>
                    <span className="font-medium">Apenas comprar</span>
                    <p className="text-xs text-muted-foreground">Quero apenas buscar veículos</p>
                  </div>
                </label>

                <label 
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    sellerType === 'seller' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="sellerType"
                    value="seller"
                    checked={sellerType === 'seller'}
                    onChange={() => setSellerType('seller')}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    sellerType === 'seller' ? 'border-primary' : 'border-muted-foreground'
                  }`}>
                    {sellerType === 'seller' && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div>
                    <span className="font-medium">Vendedor independente</span>
                    <p className="text-xs text-muted-foreground">Quero anunciar meus carros</p>
                  </div>
                </label>

                <label 
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    sellerType === 'dealer' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="sellerType"
                    value="dealer"
                    checked={sellerType === 'dealer'}
                    onChange={() => setSellerType('dealer')}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    sellerType === 'dealer' ? 'border-primary' : 'border-muted-foreground'
                  }`}>
                    {sellerType === 'dealer' && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div>
                    <span className="font-medium">Sou lojista</span>
                    <p className="text-xs text-muted-foreground">Tenho uma loja de veículos</p>
                  </div>
                </label>
              </div>
            </div>

            {sellerType === 'dealer' && (
              <div className="space-y-2">
                <Label htmlFor="dealerName">Nome da Loja *</Label>
                <Input
                  id="dealerName"
                  type="text"
                  placeholder="Ex: Auto Center Silva"
                  value={formData.dealerName}
                  onChange={(e) => setFormData({ ...formData, dealerName: e.target.value })}
                  required
                />
              </div>
            )}

            {(sellerType === 'seller' || sellerType === 'dealer') && (
              <div className="p-4 rounded-xl gradient-brand-soft border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  {sellerType === 'dealer' 
                    ? 'Sua loja passará por aprovação antes de aparecer publicamente. Você poderá completar os dados no seu perfil.'
                    : 'Ao se cadastrar como vendedor, seu perfil passará por aprovação antes de poder criar anúncios.'
                  }
                </p>
              </div>
            )}

            <Button type="submit" variant="brand" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Já tem uma conta?{' '}
            <Link 
              href={`/login${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
              className="text-primary font-medium hover:underline"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function RegisterClient() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando formulário...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
