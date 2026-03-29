"use client";

import { useState, useRef, useEffect } from 'react';
import { Store, Camera, Loader2, Globe,   MapPin, Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { fetchApi } from '@/lib/api';
import { compressImage } from '@/lib/imageCompression';
import { generateDealerSlug } from '@/hooks/useDealers';

interface DealerSettingsProps {
  profile: any;
  userRole: string;
}

export function DealerSettings({ profile, userRole }: DealerSettingsProps) {
  const { toast } = useToast();
  const { updateProfile } = useAuth();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [storeUrl, setStoreUrl] = useState<string | null>(null);
  
  useEffect(() => {
    if (profile?.dealer_slug && typeof window !== 'undefined') {
      setStoreUrl(`${window.location.origin}/loja/${profile.dealer_slug}`);
    }
  }, [profile?.dealer_slug]);
  
  const copyStoreLink = () => {
    if (storeUrl) {
      navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      toast({ title: "Link copiado!" });
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const [dealerData, setDealerData] = useState({
    is_dealer: profile?.is_dealer || false,
    dealer_name: profile?.dealer_name || '',
    dealer_description: profile?.dealer_description || '',
    dealer_address: profile?.dealer_address || '',
    dealer_cnpj: profile?.dealer_cnpj || '',
    dealer_instagram: profile?.dealer_instagram || '',
    dealer_facebook: profile?.dealer_facebook || '',
    dealer_website: profile?.dealer_website || '',
  });

  // Only show for editors/sellers
  if (userRole === 'user') {
    return null;
  }

  const handleImageUpload = async (
    file: File,
    type: 'logo' | 'banner',
    setUploading: (v: boolean) => void
  ) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive"
      });
      return null;
    }

    setUploading(true);

    try {
      let fileToUpload: Blob | File = file;
      
      if (file.size > 500 * 1024) {
        fileToUpload = await compressImage(file, 0.7, type === 'logo' ? 400 : 1200);
      }

      const formData = new FormData();
      formData.append('file', fileToUpload);

      const response = await fetchApi<{ url: string }>('/media/upload/avatar', {
        method: 'POST',
        body: formData,
        requireAuth: true,
      });

      return response.url;
    } catch (error: any) {
      console.error(`${type} upload error:`, error);
      toast({
        title: "Erro ao enviar imagem",
        description: error.message || "Tente novamente.",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await handleImageUpload(file, 'logo', setIsUploadingLogo);
    if (url) {
      await updateProfile({ dealer_logo: url } as any);
      toast({ title: "Logo atualizado!" });
    }
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await handleImageUpload(file, 'banner', setIsUploadingBanner);
    if (url) {
      await updateProfile({ dealer_banner: url } as any);
      toast({ title: "Banner atualizado!" });
    }
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const slug = dealerData.dealer_name 
        ? generateDealerSlug(dealerData.dealer_name)
        : null;

      const updateData: any = {
        is_dealer: dealerData.is_dealer,
        dealer_name: dealerData.dealer_name || null,
        dealer_slug: slug,
        dealer_description: dealerData.dealer_description || null,
        dealer_address: dealerData.dealer_address || null,
        dealer_cnpj: dealerData.dealer_cnpj || null,
        dealer_instagram: dealerData.dealer_instagram || null,
        dealer_facebook: dealerData.dealer_facebook || null,
        dealer_website: dealerData.dealer_website || null,
      };

      if (dealerData.is_dealer && !profile?.dealer_since) {
        updateData.dealer_since = new Date().toISOString();
      }

      await updateProfile(updateData);

      toast({
        title: "Configurações de loja salvas!",
        description: dealerData.is_dealer && slug
          ? `Sua loja está disponível em /loja/${slug}`
          : undefined
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl p-6 shadow-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg gradient-brand">
            <Store className="h-5 w-5 text-white" />
          </div>
          <h3 className="font-heading font-semibold">Configurações de Lojista</h3>
        </div>
        <Switch
          checked={dealerData.is_dealer}
          onCheckedChange={(v) => setDealerData({ ...dealerData, is_dealer: v })}
        />
      </div>

      {dealerData.is_dealer && (
        <>
          {/* Logo & Banner Uploads */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Logo da Loja</Label>
              <button
                onClick={() => logoInputRef.current?.click()}
                disabled={isUploadingLogo}
                className="w-full aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex items-center justify-center overflow-hidden bg-muted/50"
              >
                {isUploadingLogo ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : profile?.dealer_logo ? (
                  <img src={profile.dealer_logo} alt="Logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <Camera className="h-6 w-6 text-muted-foreground" />
                )}
              </button>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                Banner <span className="text-muted-foreground/60">(1200x400px recomendado)</span>
              </Label>
              <button
                onClick={() => bannerInputRef.current?.click()}
                disabled={isUploadingBanner}
                className="w-full aspect-[3/1] rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center overflow-hidden bg-muted/50 gap-1"
              >
                {isUploadingBanner ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : profile?.dealer_banner ? (
                  <img src={profile.dealer_banner} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Camera className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">1200 x 400 px</span>
                  </>
                )}
              </button>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerChange}
              />
            </div>
          </div>
          
          {/* Store Link */}
          {storeUrl && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <Label className="text-xs text-muted-foreground mb-2 block">Link da sua loja</Label>
              <div className="flex items-center gap-2">
                <Input 
                  value={storeUrl} 
                  readOnly 
                  className="bg-background text-sm"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={copyStoreLink}
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  asChild
                >
                  <a href={storeUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="dealer_name">Nome da Loja *</Label>
            <div className="relative">
              <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="dealer_name"
                className="pl-10"
                value={dealerData.dealer_name}
                onChange={(e) => setDealerData({ ...dealerData, dealer_name: e.target.value })}
                placeholder="Nome da sua loja"
              />
            </div>
            {dealerData.dealer_name && (
              <p className="text-xs text-muted-foreground">
                URL: /loja/{generateDealerSlug(dealerData.dealer_name)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dealer_description">Descrição</Label>
            <Textarea
              id="dealer_description"
              value={dealerData.dealer_description}
              onChange={(e) => setDealerData({ ...dealerData, dealer_description: e.target.value })}
              placeholder="Fale sobre sua loja..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dealer_address">Endereço</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="dealer_address"
                className="pl-10"
                value={dealerData.dealer_address}
                onChange={(e) => setDealerData({ ...dealerData, dealer_address: e.target.value })}
                placeholder="Endereço completo"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dealer_cnpj">CNPJ</Label>
            <Input
              id="dealer_cnpj"
              value={dealerData.dealer_cnpj}
              onChange={(e) => setDealerData({ ...dealerData, dealer_cnpj: e.target.value })}
              placeholder="00.000.000/0000-00"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dealer_instagram"></Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dealer_instagram"
                  className="pl-10"
                  value={dealerData.dealer_instagram}
                  onChange={(e) => setDealerData({ ...dealerData, dealer_instagram: e.target.value })}
                  placeholder="@sualoja"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dealer_facebook"></Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dealer_facebook"
                  className="pl-10"
                  value={dealerData.dealer_facebook}
                  onChange={(e) => setDealerData({ ...dealerData, dealer_facebook: e.target.value })}
                  placeholder="URL do "
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dealer_website">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dealer_website"
                  className="pl-10"
                  value={dealerData.dealer_website}
                  onChange={(e) => setDealerData({ ...dealerData, dealer_website: e.target.value })}
                  placeholder="https://sualoja.com.br"
                />
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="kairos"
            className="w-full"
            onClick={handleSave}
            disabled={isLoading || !dealerData.dealer_name}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar configurações de loja'
            )}
          </Button>
        </>
      )}

      {!dealerData.is_dealer && (
        <p className="text-sm text-muted-foreground">
          Ative para criar sua página de loja pública e destacar seus veículos.
        </p>
      )}
    </div>
  );
}
