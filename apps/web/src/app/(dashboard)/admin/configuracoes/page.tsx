"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Code, BarChart3, Share2, Image, Type, Plus, Trash2, GripVertical, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface BannerItem { id?: string; type: string; title: string; subtitle: string; image_url: string; link_url: string; is_active: boolean; order: number; }

export default function AdminSettingsPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ gtm_id: '', ga_id: '', meta_pixel_id: '' });
  const [banners, setBanners] = useState<BannerItem[]>([
    { id: '1', type: 'text', title: 'Encontre seu carro dos sonhos', subtitle: 'Milhares de ofertas verificadas', image_url: '', link_url: '/veiculos', is_active: true, order: 0 },
  ]);

  const save = (msg: string) => { setIsSaving(true); setTimeout(() => { setIsSaving(false); toast.success(msg); }, 800); };
  const addBanner = () => setBanners([...banners, { type: 'text', title: '', subtitle: '', image_url: '', link_url: '', is_active: true, order: banners.length }]);
  const updateBanner = (i: number, f: string, v: any) => { const u = [...banners]; u[i] = { ...u[i], [f]: v }; setBanners(u); };
  const removeBanner = (i: number) => { setBanners(banners.filter((_, x) => x !== i)); toast.success('Banner removido!'); };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b"><div className="container py-4"><div className="flex items-center gap-4"><Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button><h1 className="font-heading text-xl font-bold">Configurações</h1></div></div></div>
      <div className="container py-6"><div className="max-w-3xl mx-auto space-y-8">
        <form onSubmit={(e) => { e.preventDefault(); save('Pixels salvos!'); }} className="space-y-6">
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h2 className="font-heading font-semibold text-lg mb-6 flex items-center gap-2"><Code className="h-5 w-5 text-primary" />Pixels de Rastreamento</h2>
            <div className="space-y-6">
              <div className="space-y-2"><Label className="flex items-center gap-2"><div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center text-white text-xs font-bold">GTM</div>Google Tag Manager ID</Label><Input placeholder="GTM-XXXXXXX" value={formData.gtm_id} onChange={(e) => setFormData({...formData, gtm_id: e.target.value})} /><p className="text-xs text-muted-foreground">Adiciona o GTM em todas as páginas</p></div>
              <div className="space-y-2"><Label className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-orange-500" />Google Analytics ID</Label><Input placeholder="G-XXXXXXXXXX" value={formData.ga_id} onChange={(e) => setFormData({...formData, ga_id: e.target.value})} /></div>
              <div className="space-y-2"><Label className="flex items-center gap-2"><Share2 className="h-5 w-5 text-blue-600" />Meta Pixel ID</Label><Input placeholder="XXXXXXXXXXXXXXX" value={formData.meta_pixel_id} onChange={(e) => setFormData({...formData, meta_pixel_id: e.target.value})} /></div>
            </div>
          </div>
          <Button type="submit" size="lg" className="w-full bg-[#268052] hover:bg-[#1e6642]" disabled={isSaving}>{isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</> : <><Save className="h-4 w-4 mr-2" />Salvar Pixels</>}</Button>
        </form>
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-6"><h2 className="font-heading font-semibold text-lg flex items-center gap-2"><Image className="h-5 w-5 text-primary" />Banners da Home</h2><Button variant="outline" size="sm" onClick={addBanner}><Plus className="h-4 w-4 mr-2" />Adicionar</Button></div>
          <p className="text-sm text-muted-foreground mb-6">Banners ativos rotacionam a cada 5s.</p>
          <div className="space-y-6">
            {banners.map((b, i) => (
              <div key={b.id || i} className="border rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between"><div className="flex items-center gap-3"><GripVertical className="h-5 w-5 text-muted-foreground" /><span className="font-medium">Banner {i+1}</span></div><div className="flex items-center gap-3"><Switch checked={b.is_active} onCheckedChange={(c) => updateBanner(i,'is_active',c)} /><Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeBanner(i)}><Trash2 className="h-4 w-4" /></Button></div></div>
                <Select value={b.type} onValueChange={(v) => updateBanner(i,'type',v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="text"><span className="flex items-center gap-2"><Type className="h-4 w-4" />Texto</span></SelectItem><SelectItem value="image"><span className="flex items-center gap-2"><Image className="h-4 w-4" />Imagem</span></SelectItem></SelectContent></Select>
                {b.type === 'text' ? (<><div className="space-y-2"><Label>Título</Label><Input value={b.title} onChange={(e) => updateBanner(i,'title',e.target.value)} /></div><div className="space-y-2"><Label>Subtítulo</Label><Input value={b.subtitle} onChange={(e) => updateBanner(i,'subtitle',e.target.value)} /></div></>) : (<div className="space-y-2"><Label>URL da Imagem</Label><Input placeholder="https://..." value={b.image_url} onChange={(e) => updateBanner(i,'image_url',e.target.value)} /><p className="text-xs text-muted-foreground">1600×400, PNG/JPG/WEBP, máx 5MB</p></div>)}
                <div className="space-y-2"><Label className="flex items-center gap-2"><ExternalLink className="h-4 w-4" />Link (opcional)</Label><Input value={b.link_url} onChange={(e) => updateBanner(i,'link_url',e.target.value)} placeholder="/veiculos" /></div>
              </div>
            ))}
            <Button size="lg" className="w-full bg-[#268052] hover:bg-[#1e6642]" onClick={() => save('Banners salvos!')} disabled={isSaving}>{isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</> : <><Save className="h-4 w-4 mr-2" />Salvar Banners</>}</Button>
          </div>
        </div>
      </div></div>
    </div>
  );
}
