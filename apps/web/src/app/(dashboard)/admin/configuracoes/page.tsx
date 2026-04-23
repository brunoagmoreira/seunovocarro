"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Loader2,
  Code,
  BarChart3,
  Share2,
  KeyRound,
  Image,
  Type,
  Plus,
  Trash2,
  GripVertical,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useAdminSiteSettings, useUpdateSiteSettings } from '@/hooks/useSiteSettings';

interface BannerItem {
  id?: string;
  type: string;
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
  is_active: boolean;
  order: number;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const { data: siteSettings, isLoading: settingsLoading } = useAdminSiteSettings();
  const updateSettings = useUpdateSiteSettings();

  const [formData, setFormData] = useState({
    gtm_id: '',
    ga_id: '',
    meta_pixel_id: '',
    google_oauth_client_id: '',
  });
  const [googleClientSecret, setGoogleClientSecret] = useState('');
  const [secretWasSet, setSecretWasSet] = useState(false);

  const [banners, setBanners] = useState<BannerItem[]>([
    {
      id: '1',
      type: 'text',
      title: 'Encontre seu carro dos sonhos',
      subtitle: 'Milhares de ofertas verificadas',
      image_url: '',
      link_url: '/veiculos',
      is_active: true,
      order: 0,
    },
  ]);

  useEffect(() => {
    if (!siteSettings) return;
    setFormData({
      gtm_id: siteSettings.gtm_id ?? '',
      ga_id: siteSettings.ga_id ?? '',
      meta_pixel_id: siteSettings.meta_pixel_id ?? '',
      google_oauth_client_id: siteSettings.google_oauth_client_id ?? '',
    });
    setSecretWasSet(siteSettings.google_oauth_client_secret_set);
    setGoogleClientSecret('');
  }, [siteSettings]);

  const saveTrackingAndGoogle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body: Record<string, string | null> = {
        gtm_id: formData.gtm_id.trim() || null,
        ga_id: formData.ga_id.trim() || null,
        meta_pixel_id: formData.meta_pixel_id.trim() || null,
        google_oauth_client_id: formData.google_oauth_client_id.trim() || null,
      };
      if (googleClientSecret.trim()) {
        body.google_oauth_client_secret = googleClientSecret.trim();
      }
      await updateSettings.mutateAsync(body);
      setGoogleClientSecret('');
      toast.success('Configurações salvas.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha ao salvar';
      toast.error(message);
    }
  };

  const addBanner = () =>
    setBanners([
      ...banners,
      {
        type: 'text',
        title: '',
        subtitle: '',
        image_url: '',
        link_url: '',
        is_active: true,
        order: banners.length,
      },
    ]);
  const updateBanner = (i: number, f: string, v: string | boolean) => {
    const u = [...banners];
    u[i] = { ...u[i], [f]: v };
    setBanners(u);
  };
  const removeBanner = (i: number) => {
    setBanners(banners.filter((_, x) => x !== i));
    toast.success('Banner removido!');
  };

  const saving = updateSettings.isPending;

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-heading text-xl font-bold">Configurações</h1>
          </div>
        </div>
      </div>
      <div className="container py-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <form onSubmit={saveTrackingAndGoogle} className="space-y-6">
            <div className="bg-card rounded-2xl p-6 shadow-card">
              <h2 className="font-heading font-semibold text-lg mb-6 flex items-center gap-2">
                <Code className="h-5 w-5 text-primary" />
                Pixels de rastreamento
              </h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                      GTM
                    </div>
                    Google Tag Manager ID
                  </Label>
                  <Input
                    placeholder="GTM-XXXXXXX"
                    value={formData.gtm_id}
                    onChange={(e) => setFormData({ ...formData, gtm_id: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Adiciona o GTM em todas as páginas</p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-orange-500" />
                    Google Analytics ID
                  </Label>
                  <Input
                    placeholder="G-XXXXXXXXXX"
                    value={formData.ga_id}
                    onChange={(e) => setFormData({ ...formData, ga_id: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-blue-600" />
                    Meta Pixel ID
                  </Label>
                  <Input
                    placeholder="XXXXXXXXXXXXXXX"
                    value={formData.meta_pixel_id}
                    onChange={(e) => setFormData({ ...formData, meta_pixel_id: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-card">
              <h2 className="font-heading font-semibold text-lg mb-2 flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                Login com Google
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Configure o OAuth Web Client no Google Cloud Console. Em &quot;Origens JavaScript
                autorizadas&quot;, inclua a URL do site (ex.: https://seunovocarro.com.br e
                http://localhost:3000 em desenvolvimento).
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>ID do cliente (Client ID)</Label>
                  <Input
                    placeholder="xxxx.apps.googleusercontent.com"
                    value={formData.google_oauth_client_id}
                    onChange={(e) =>
                      setFormData({ ...formData, google_oauth_client_id: e.target.value })
                    }
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Chave secreta do cliente (Client secret)</Label>
                  <Input
                    type="password"
                    placeholder={
                      secretWasSet ? '•••••••• (deixe em branco para manter)' : 'GOCSPX-…'
                    }
                    value={googleClientSecret}
                    onChange={(e) => setGoogleClientSecret(e.target.value)}
                    autoComplete="new-password"
                  />
                  <p className="text-xs text-muted-foreground">
                    A chave fica só no servidor; não é exibida depois de salva. Preencha de novo
                    apenas para trocar.
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-[#268052] hover:bg-[#1e6642]"
              disabled={saving || settingsLoading}
            >
              {saving || settingsLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar pixels e Google
                </>
              )}
            </Button>
          </form>

          <div className="bg-card rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
                <Image className="h-5 w-5 text-primary" />
                Banners da Home
              </h2>
              <Button variant="outline" size="sm" onClick={addBanner}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Banners ativos rotacionam a cada 5s.</p>
            <div className="space-y-6">
              {banners.map((b, i) => (
                <div key={b.id || i} className="border rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Banner {i + 1}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={b.is_active}
                        onCheckedChange={(c) => updateBanner(i, 'is_active', c)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => removeBanner(i)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Select value={b.type} onValueChange={(v) => updateBanner(i, 'type', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">
                        <span className="flex items-center gap-2">
                          <Type className="h-4 w-4" />
                          Texto
                        </span>
                      </SelectItem>
                      <SelectItem value="image">
                        <span className="flex items-center gap-2">
                          <Image className="h-4 w-4" />
                          Imagem
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {b.type === 'text' ? (
                    <>
                      <div className="space-y-2">
                        <Label>Título</Label>
                        <Input
                          value={b.title}
                          onChange={(e) => updateBanner(i, 'title', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Subtítulo</Label>
                        <Input
                          value={b.subtitle}
                          onChange={(e) => updateBanner(i, 'subtitle', e.target.value)}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Label>URL da Imagem</Label>
                      <Input
                        placeholder="https://..."
                        value={b.image_url}
                        onChange={(e) => updateBanner(i, 'image_url', e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        1600×400, PNG/JPG/WEBP, máx 5MB
                      </p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Link (opcional)
                    </Label>
                    <Input
                      value={b.link_url}
                      onChange={(e) => updateBanner(i, 'link_url', e.target.value)}
                      placeholder="/veiculos"
                    />
                  </div>
                </div>
              ))}
              <Button
                size="lg"
                type="button"
                className="w-full bg-[#268052] hover:bg-[#1e6642]"
                onClick={() => toast.message('Em breve: persistência dos banners na API.')}
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Banners
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
