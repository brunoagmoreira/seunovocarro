"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, ImagePlus, X, GripVertical, Star, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { fetchApi } from '@/lib/api';
import { BRANDS, STATES, FUEL_TYPES, TRANSMISSION_TYPES } from '@/types/vehicle';
import { applyWatermark } from '@/lib/watermark';
import { useCities } from '@/hooks/useCities';

interface VehicleMedia {
  id: string;
  url: string;
  type: 'image' | 'video';
  order: number;
  is_primary?: boolean;
}

const PHOTO_GUIDELINES = [
  { emoji: '🚗', text: 'Frente do veículo' },
  { emoji: '🔙', text: 'Traseira' },
  { emoji: '➡️', text: 'Lateral direita' },
  { emoji: '⬅️', text: 'Lateral esquerda' },
  { emoji: '🪑', text: 'Interior/Bancos' },
  { emoji: '🔧', text: 'Motor' },
  { emoji: '📦', text: 'Porta-malas' },
  { emoji: '🛞', text: 'Estado dos pneus' },
  { emoji: '📊', text: 'Painel com km' },
];

export function EditVehicleClient({ vehicleId }: { vehicleId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [originalData, setOriginalData] = useState<any>(null);
  
  const [existingMedia, setExistingMedia] = useState<VehicleMedia[]>([]);
  const [mediaToDelete, setMediaToDelete] = useState<string[]>([]);
  
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    version: '',
    yearManufacture: new Date().getFullYear(),
    yearModel: new Date().getFullYear(),
    mileage: 0,
    transmission: 'automatic',
    fuel: 'flex',
    color: '',
    doors: 4,
    plateEnding: '',
    price: 0,
    description: '',
    city: '',
    state: '',
    whatsapp: '',
    phone: ''
  });

  const { cities, isLoading: citiesLoading } = useCities(formData.state);

  useEffect(() => {
    if (vehicleId && user) fetchVehicle();
  }, [vehicleId, user]);

  const fetchVehicle = async () => {
    try {
      let ownerVehicle: any;
      try {
        ownerVehicle = await fetchApi<any>(`/vehicles/mine/${vehicleId}`, {
          requireAuth: true
        });
      } catch {
        // Backward-compatible fallback if endpoint is not available yet on some deploy node
        const mineList = await fetchApi<any[]>('/vehicles/mine', { requireAuth: true });
        ownerVehicle = mineList.find((v) => v.id === vehicleId);
      }

      if (!ownerVehicle) throw new Error('Not found');

      const vehicleFormData = {
        brand: ownerVehicle.brand,
        model: ownerVehicle.model,
        version: ownerVehicle.version || '',
        yearManufacture: ownerVehicle.year,
        yearModel: ownerVehicle.year,
        mileage: ownerVehicle.mileage,
        transmission: ownerVehicle.transmission,
        fuel: ownerVehicle.fuel,
        color: ownerVehicle.color || '',
        doors: ownerVehicle.doors || 4,
        plateEnding: ownerVehicle.plate_ending || '',
        price: ownerVehicle.price,
        description: ownerVehicle.description || '',
        city: ownerVehicle.city,
        state: ownerVehicle.state,
        whatsapp: ownerVehicle.whatsapp || '',
        phone: ownerVehicle.phone || ''
      };
      
      setFormData(vehicleFormData);
      setOriginalData(vehicleFormData);

      const media = (ownerVehicle.media || []).sort((a: any, b: any) => a.order - b.order);
      setExistingMedia(media.map((m: any, i: number) => ({ 
        ...m, 
        is_primary: i === 0 
      })));
      
      const videoMedia = media.filter((m: any) => m.type === 'video');
      setYoutubeUrls(videoMedia.map((v: any) => v.url));
      
      setIsLoading(false);
    } catch (error) {
      toast({
        title: "Veículo não encontrado",
        description: "Este veículo não existe ou você não tem permissão.",
        variant: "destructive"
      });
      router.push('/meus-anuncios');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingMedia.length + newImages.length - mediaToDelete.filter(id => 
      existingMedia.find(m => m.id === id)
    ).length;
    
    if (totalImages + files.length > 10) {
      toast({
        title: "Limite de imagens",
        description: "Máximo de 10 imagens por anúncio.",
        variant: "destructive"
      });
      return;
    }

    setNewImages([...newImages, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = (mediaId: string) => {
    setMediaToDelete(prev => [...prev, mediaId]);
    setExistingMedia(prev => prev.filter(m => m.id !== mediaId));
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const setPrimaryImage = (mediaId: string) => {
    setExistingMedia(prev => prev.map(m => ({
      ...m,
      is_primary: m.id === mediaId,
      order: m.id === mediaId ? 0 : m.order + 1
    })).sort((a, b) => a.order - b.order));
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newOrder = [...existingMedia];
    const [removed] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, removed);
    setExistingMedia(newOrder.map((m, i) => ({ ...m, order: i })));
  };

  const addYoutubeVideo = () => {
    if (!youtubeUrl) return;
    const videoId = extractYoutubeId(youtubeUrl);
    if (!videoId) {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL válida do YouTube.",
        variant: "destructive"
      });
      return;
    }
    
    if (youtubeUrls.length >= 2) {
      toast({
        title: "Limite de vídeos",
        description: "Máximo de 2 vídeos por anúncio.",
        variant: "destructive"
      });
      return;
    }
    
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    setYoutubeUrls(prev => [...prev, embedUrl]);
    setYoutubeUrl('');
  };

  const extractYoutubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const removeYoutubeVideo = (index: number) => {
    setYoutubeUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent, asDraft = false) => {
    e.preventDefault();
    
    if (!formData.brand || !formData.model || !formData.price) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha marca, modelo e preço.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.yearManufacture || !formData.yearModel) {
      toast({
        title: "Ano obrigatório",
        description: "Preencha ano de fabricação e ano modelo.",
        variant: "destructive"
      });
      return;
    }

    const totalImages = existingMedia.length + newImages.length;
    if (totalImages === 0) {
      toast({
        title: "Adicione fotos",
        description: "É necessário pelo menos 1 foto do veículo.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    try {
      // Step 1: Upload NEW images to R2
      const newUploadedMedia: any[] = [];
      for (let i = 0; i < newImages.length; i++) {
        const file = newImages[i];
        const watermarkedBlob = await applyWatermark(file, {
          opacity: 0.3, position: 'center', scale: 0.3,
        });
        
        const uploadFormData = new FormData();
        uploadFormData.append('file', new File([watermarkedBlob], `edit_${Date.now()}_${i}.jpg`, { type: 'image/jpeg' }));
        
        const { url } = await fetchApi<{ url: string }>('/media/upload/vehicle', {
          method: 'POST', body: uploadFormData, requireAuth: true
        });
        
        newUploadedMedia.push({ url, type: 'image', order: 0 }); // Order will be set below
      }

      // Step 2: Combine existing and new media with new orders
      const finalMedia = [
        ...existingMedia.map((m, i) => ({ url: m.url, type: 'image', order: i })),
        ...newUploadedMedia.map((m, i) => ({ ...m, order: existingMedia.length + i })),
        ...youtubeUrls.map((url, i) => ({ url, type: 'video', order: 100 + i }))
      ];

      // Step 3: Update vehicle data and media via single PATCH
      await fetchApi(`/vehicles/${vehicleId}`, {
        method: 'PATCH',
        body: {
          ...formData,
          year: formData.yearModel,
          status: asDraft ? 'draft' : 'pending',
          media: finalMedia
        },
        requireAuth: true
      });

      toast({
        title: asDraft ? "Rascunho salvo!" : "Anúncio atualizado!",
        description: asDraft ? "Seu rascunho foi salvo." : "Seu anúncio foi atualizado com sucesso.",
      });

      router.push('/meus-anuncios');
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar anúncio",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background pt-16">
      <div className="sticky top-16 z-10 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-heading text-xl font-bold">Editar Anúncio</h1>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <form onSubmit={(e) => handleSubmit(e, false)} className="max-w-2xl mx-auto space-y-6">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
            <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
              📸 Orientações para fotos
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm">
              {PHOTO_GUIDELINES.map((guide, i) => (
                <div key={i} className="flex items-center gap-2 text-muted-foreground">
                  <span>{guide.emoji}</span>
                  <span className="truncate">{guide.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label>Fotos do veículo (arraste para reorganizar)</Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {existingMedia.map((media, index) => (
                <div 
                  key={media.id} 
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 ${
                    media.is_primary ? 'border-primary' : 'border-border'
                  }`}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('index', index.toString())}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const fromIndex = parseInt(e.dataTransfer.getData('index'));
                    moveImage(fromIndex, index);
                  }}
                >
                  <img src={media.url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                    <GripVertical className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute top-1 right-1 flex gap-1">
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(media.id)}
                      className={`p-1 rounded-full ${media.is_primary ? 'bg-primary' : 'bg-black/50'} text-white`}
                    >
                      <Star className={`h-3 w-3 ${media.is_primary ? 'fill-white' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeExistingImage(media.id)}
                      className="p-1 rounded-full bg-destructive text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  {media.is_primary && (
                    <span className="absolute bottom-1 left-1 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      Principal
                    </span>
                  )}
                </div>
              ))}
              
              {newPreviews.map((preview, index) => (
                <div key={`new-${index}`} className="relative aspect-square rounded-xl overflow-hidden border border-border">
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  <span className="absolute top-1 left-1 text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">Nova</span>
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              
              {existingMedia.length + newImages.length < 10 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center gap-2">
                  <ImagePlus className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Adicionar</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Label>Vídeos do YouTube (máximo 2)</Label>
            <div className="flex gap-2">
              <Input
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="Cole a URL do YouTube aqui"
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={addYoutubeVideo}>
                <Globe className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
            
            {youtubeUrls.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {youtubeUrls.map((url, index) => (
                  <div key={index} className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                    <iframe src={url} className="w-full h-full" allowFullScreen />
                    <button
                      type="button"
                      onClick={() => removeYoutubeVideo(index)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-card space-y-4">
            <h2 className="font-heading font-semibold">Informações do veículo</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Marca *</Label>
                <Select value={formData.brand} onValueChange={(v) => setFormData({ ...formData, brand: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {BRANDS.map(brand => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Modelo *</Label>
                <Input value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} placeholder="Ex: Civic" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Versão</Label>
              <Input value={formData.version} onChange={(e) => setFormData({ ...formData, version: e.target.value })} placeholder="Ex: Touring" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Ano Fabricação *</Label>
                <Input type="number" value={formData.yearManufacture} onChange={(e) => setFormData({ ...formData, yearManufacture: parseInt(e.target.value) || 0 })} min={1990} max={new Date().getFullYear() + 1} />
              </div>
              <div className="space-y-2">
                <Label>Ano Modelo *</Label>
                <Input type="number" value={formData.yearModel} onChange={(e) => setFormData({ ...formData, yearModel: parseInt(e.target.value) || 0 })} min={1990} max={new Date().getFullYear() + 1} />
              </div>
              <div className="space-y-2">
                <Label>KM *</Label>
                <Input type="number" value={formData.mileage} onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) || 0 })} min={0} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Câmbio</Label>
                <Select value={formData.transmission} onValueChange={(v) => setFormData({ ...formData, transmission: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TRANSMISSION_TYPES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Combustível</Label>
                <Select value={formData.fuel} onValueChange={(v) => setFormData({ ...formData, fuel: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(FUEL_TYPES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Cor</Label>
                <Input value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} placeholder="Ex: Preto" />
              </div>
              <div className="space-y-2">
                <Label>Portas</Label>
                <Select value={formData.doors.toString()} onValueChange={(v) => setFormData({ ...formData, doors: parseInt(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 portas</SelectItem>
                    <SelectItem value="4">4 portas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Final da Placa</Label>
                <Input value={formData.plateEnding} onChange={(e) => { const val = e.target.value.replace(/\D/g, '').slice(0, 1); setFormData({...formData, plateEnding: val}) }} placeholder="Ex: 5" maxLength={1} className="text-center" />
                <p className="text-xs text-muted-foreground">Apenas o último dígito</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preço (R$) *</Label>
              <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} min={0} step={100} />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Descreva os diferenciais do veículo, opcionais, histórico..." rows={4} />
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-card space-y-4">
            <h2 className="font-heading font-semibold">Localização e contato</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estado *</Label>
                <Select value={formData.state} onValueChange={(v) => setFormData({ ...formData, state: v })}>
                  <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                  <SelectContent>
                    {STATES.map(state => (
                      <SelectItem key={state.uf} value={state.uf}>{state.uf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cidade *</Label>
                <Select value={formData.city} onValueChange={(v) => setFormData({ ...formData, city: v })} disabled={!formData.state || citiesLoading}>
                  <SelectTrigger>
                    {citiesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SelectValue placeholder="Selecione" />}
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
              <Label>WhatsApp *</Label>
              <Input value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} placeholder="11999999999" />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={(e) => handleSubmit(e as any, true)} disabled={isSaving}>
              Salvar rascunho
            </Button>
            <Button type="submit" variant="kairos" className="flex-1" disabled={isSaving}>
              {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Atualizando...</> : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
