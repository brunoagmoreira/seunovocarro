"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Loader2, LogOut, User, MapPin, Phone, Mail, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
// TODO: Replace with Next.js API abstraction in backend migration phase
import { supabase } from '@/integrations/supabase/client';
import { STATES } from '@/types/vehicle';
import { Badge } from '@/components/ui/badge';
import { compressImage } from '@/lib/imageCompression';
import { DealerSettings } from '@/components/profile/DealerSettings';

export function ProfileClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, profile, userRole, signOut, updateProfile } = useAuth();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    whatsapp: profile?.whatsapp || '',
    city: profile?.city || '',
    state: profile?.state || '',
  });

  if (!user && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-20">
        <p className="text-muted-foreground">Redirecionando para login...</p>
      </div>
    );
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      let fileToUpload: Blob | File = file;
      
      if (file.size > 500 * 1024) { 
        toast({
          title: "Comprimindo imagem...",
          description: "Aguarde enquanto otimizamos sua foto.",
        });
        fileToUpload = await compressImage(file, 0.5, 400);
      }

      const fileExt = 'jpg'; 
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('avatars')
        .upload(fileName, fileToUpload, { 
          upsert: true,
          contentType: 'image/jpeg'
        });

      if (uploadError) {
        if (uploadError.message.includes('row-level security') || uploadError.message.includes('Bucket not found')) {
          throw new Error('O bucket "avatars" precisa ser criado como público no Supabase. Veja as instruções no console.');
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;

      await updateProfile({ avatar_url: urlWithCacheBust });

      toast({
        title: "Foto atualizada!",
        description: "Sua foto de perfil foi alterada com sucesso.",
      });
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast({
        title: "Erro ao enviar foto",
        description: error.message || "Tente novamente. Certifique-se de que o bucket 'avatars' existe no Supabase.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await updateProfile({
      full_name: formData.full_name,
      phone: formData.phone,
      whatsapp: formData.whatsapp || formData.phone,
      city: formData.city,
      state: formData.state,
    });

    if (error) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
    }

    setIsLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const roleLabels = {
    user: 'Comprador',
    dealer: 'Vendedor/Lojista',
    admin: 'Administrador',
    editor: 'Vendedor' // Legacy compatibility
  };

  const roleLabel = roleLabels[userRole as keyof typeof roleLabels] || 'Comprador';

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background pt-16">
      <div className="sticky top-16 z-10 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-heading text-xl font-bold">Meu Perfil</h1>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'Avatar'} />
                  <AvatarFallback className="text-2xl gradient-brand text-primary-foreground">
                    {getInitials(profile?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              <h2 className="font-heading font-bold text-xl">
                {profile?.full_name || 'Usuário'}
              </h2>
              <p className="text-muted-foreground text-sm mb-2">{user.email}</p>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {roleLabel}
              </Badge>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 shadow-card space-y-4">
            <h3 className="font-heading font-semibold mb-4">Informações pessoais</h3>

            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  className="pl-10"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Seu nome"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  className="pl-10"
                  value={user.email || ''}
                  disabled
                />
              </div>
              <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  className="pl-10"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="whatsapp"
                  type="tel"
                  className="pl-10"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <p className="text-xs text-muted-foreground">Deixe em branco para usar o telefone como WhatsApp.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="city"
                    className="pl-10"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Sua cidade"
                  />
                </div>
              </div>

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
            </div>

            <Button
              type="submit"
              variant="brand"
              className="w-full mt-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar alterações'
              )}
            </Button>
          </form>

          {/* Dealer Settings - Extracted profile role handler properly mapped */}
          <DealerSettings profile={{...profile, role: userRole} as any} userRole={userRole} />

          {/* Logout */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair da conta
          </Button>
        </div>
      </div>
    </div>
  );
}
