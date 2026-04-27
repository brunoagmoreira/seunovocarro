"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, X, Loader2, ImagePlus, GripVertical, Star } from 'lucide-react';
import { uploadVehiclePhotoFiles } from '@/lib/vehiclePhotoUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useCities } from '@/hooks/useCities';
import { useDealers } from '@/hooks/useDealers';

const normalizeCityName = (value?: string | null) =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const extractProfileCity = (raw?: string | null) => {
  const city = (raw || '').split(',')[0]?.trim();
  return city || '';
};

export function CreateVehicleClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, profile, isApproved, userRole } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  // Note: userRole was removed from useAuth in the JWT refactor (now inferred from profile)
  // Actually, userRole IS present in useAuth!
  const isDealer = userRole === 'editor' || userRole === 'admin';
  const [adMode, setAdMode] = useState<'sale' | 'rental' | null>(null);
  
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
    city: profile?.city || '',
    state: profile?.state || '',
    whatsapp: profile?.whatsapp || profile?.phone || '',
    phone: profile?.phone || '',
    listingType: 'sale' as 'sale' | 'rental',
    acceptsTrade: false
  });

  const { cities, isLoading: citiesLoading } = useCities(formData.state);
  const { data: dealers } = useDealers();
  const currentDealer = dealers?.find((dealer) => dealer.user_id === user?.id);

  const resolveCityFromProfile = useCallback((rawCity?: string | null) => {
    const candidate = extractProfileCity(rawCity);
    if (!candidate || cities.length === 0) return '';
    const normalizedCandidate = normalizeCityName(candidate);
    const exact = cities.find((c) => normalizeCityName(c.nome) === normalizedCandidate);
    if (exact) return exact.nome;
    const contains = cities.find((c) => normalizeCityName(c.nome).includes(normalizedCandidate));
    if (contains) return contains.nome;
    return '';
  }, [cities]);

  useEffect(() => {
    if (formData.state && formData.city) {
      const normalizedCurrent = normalizeCityName(formData.city);
      const cityExists = cities.some((c) => normalizeCityName(c.nome) === normalizedCurrent);
      if (!cityExists && cities.length > 0) {
        const mappedFromProfile = resolveCityFromProfile(profile?.city);
        setFormData((prev) => ({ ...prev, city: mappedFromProfile || '' }));
      }
    }
  }, [formData.state, formData.city, cities, profile?.city, resolveCityFromProfile]);

  useEffect(() => {
    if (!profile) return;
    const mappedCity = resolveCityFromProfile(profile.city);
    const dealerCity = currentDealer?.city || '';
    const dealerState = currentDealer?.state || '';
    const dealerWhatsapp = currentDealer?.whatsapp || '';
    const dealerPhone = currentDealer?.phone || '';

    setFormData((prev) => ({
      ...prev,
      state: prev.state || profile.state || dealerState || '',
      city: prev.city || mappedCity || extractProfileCity(profile.city) || dealerCity,
      whatsapp: prev.whatsapp || profile.whatsapp || profile.phone || dealerWhatsapp || dealerPhone || '',
      phone: prev.phone || profile.phone || dealerPhone || dealerWhatsapp || '',
    }));
  }, [profile, cities, resolveCityFromProfile, currentDealer]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pt-16">
        <div className="text-center px-6 max-w-md">
          <h1 className="font-heading text-2xl font-bold mb-4">Faça login para anunciar</h1>
          <p className="text-muted-foreground mb-6">
            Você precisa estar logado para criar anúncios.
          </p>
          <Button variant="kairos" asChild>
            <Link href="/login">Fazer login</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!isDealer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pt-16">
        <div className="text-center px-6 max-w-md">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full gradient-brand-soft flex items-center justify-center">
            <span className="text-4xl">🚗</span>
          </div>
          <h1 className="font-heading text-2xl font-bold mb-4">Quer anunciar?</h1>
          <p className="text-muted-foreground mb-6">
            Para anunciar veículos, você precisa atualizar seu cadastro para perfil vendedor/lojista.
          </p>
          <Button variant="kairos" onClick={() => router.push('/perfil')}>
            Atualizar Perfil
          </Button>
        </div>
      </div>
    );
  }

  if (!isApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pt-16">
        <div className="text-center px-6 max-w-md">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full gradient-brand-soft flex items-center justify-center">
            <span className="text-4xl">⏳</span>
          </div>
          <h1 className="font-heading text-2xl font-bold mb-4">Aguardando aprovação</h1>
          <p className="text-muted-foreground">
            Seu cadastro como vendedor está sendo analisado.
          </p>
        </div>
      </div>
    );
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 10) {
      toast({
        title: "Limite de imagens",
        description: "Máximo de 10 imagens por anúncio.",
        variant: "destructive"
      });
      return;
    }

    setImages([...images, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });

    setPreviews((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const generateSlug = () => {
    const slug = `${formData.brand}-${formData.model}-${formData.yearModel}-${Date.now()}`
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return slug;
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

    if (images.length === 0) {
      toast({
        title: "Adicione fotos",
        description: "É necessário pelo menos 1 foto do veículo.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const slug = generateSlug();
      
      // Step 1: Compress, watermark, upload (batched parallel — was ~1 photo at a time full-res)
      const uploadedMedia = await uploadVehiclePhotoFiles(
        images,
        (i) => `vehicle_${i}.jpg`
      );

      // Step 2: Create vehicle with all its data and media links
      await fetchApi('/vehicles', {
        method: 'POST',
        body: {
          brand: formData.brand,
          model: formData.model,
          version: formData.version || null,
          year: formData.yearModel,
          mileage: formData.mileage,
          transmission: formData.transmission,
          fuel: formData.fuel,
          color: formData.color || null,
          doors: formData.doors,
          plate_ending: formData.plateEnding || null,
          price: formData.price,
          description: formData.description || null,
          city: formData.city,
          state: formData.state,
          whatsapp: formData.whatsapp || null,
          phone: formData.phone || null,
          listing_type: formData.listingType,
          accepts_trade: formData.listingType === 'rental' ? false : formData.acceptsTrade,
          status: asDraft ? 'draft' : 'pending',
          slug,
          media: uploadedMedia
        },
        requireAuth: true
      });

      toast({
        title: asDraft ? "Rascunho salvo!" : "Anúncio enviado!",
        description: asDraft 
          ? "Seu rascunho foi salvo." 
          : "Seu anúncio foi enviado para aprovação.",
      });

      router.push('/meus-anuncios');

    } catch (error: any) {
      console.error('Error creating vehicle:', error);
      toast({
        title: "Erro ao criar anúncio",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background pt-16">
      <Dialog open={isDealer && isApproved && !adMode}>
        <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Como deseja anunciar?</DialogTitle>
            <DialogDescription>
              Antes de continuar, selecione se este anúncio é para venda ou locação.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 pt-2">
            <Button
              type="button"
              variant="kairos"
              onClick={() => {
                setAdMode('sale');
                setFormData((prev) => ({ ...prev, listingType: 'sale' }));
              }}
            >
              Venda de veículo
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setAdMode('rental');
                setFormData((prev) => ({ ...prev, listingType: 'rental', acceptsTrade: false }));
              }}
            >
              Locação de veículo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="sticky top-16 z-10 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-xl font-bold">Criar Anúncio</h1>
              {adMode && (
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  {adMode === 'sale' ? 'Venda' : 'Locação'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <form onSubmit={(e) => handleSubmit(e, false)} className="max-w-2xl mx-auto space-y-6">
          <div className="space-y-4">
            <Label>Fotos do veículo * (arraste para reorganizar)</Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {previews.map((preview, index) => (
                <div
                  key={index}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 ${
                    index === 0 ? 'border-primary' : 'border-border'
                  }`}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('dragIndex', index.toString())}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const dragIndex = parseInt(e.dataTransfer.getData('dragIndex'));
                    moveImage(dragIndex, index);
                  }}
                >
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                    <GripVertical className="h-6 w-6 text-white" />
                  </div>
                  {index === 0 && (
                    <span className="absolute top-2 left-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full inline-flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      Principal
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {images.length < 10 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center gap-2">
                  <ImagePlus className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Adicionar</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Máximo 10 fotos. Formatos: JPG, PNG, WebP. A primeira foto será a principal.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-card space-y-4">
            <h2 className="font-heading font-semibold">Informações do veículo</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Marca *</Label>
                <Select
                  value={formData.brand}
                  onValueChange={(v) => setFormData({ ...formData, brand: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRANDS.map(brand => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Modelo *</Label>
                <Input
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="Ex: Civic"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Versão</Label>
              <Input
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="Ex: Touring"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Ano Fabricação *</Label>
                <Input
                  type="number"
                  value={formData.yearManufacture}
                  onChange={(e) => setFormData({ ...formData, yearManufacture: parseInt(e.target.value) || 0 })}
                  min={1990}
                  max={new Date().getFullYear() + 1}
                />
              </div>

              <div className="space-y-2">
                <Label>Ano Modelo *</Label>
                <Input
                  type="number"
                  value={formData.yearModel}
                  onChange={(e) => setFormData({ ...formData, yearModel: parseInt(e.target.value) || 0 })}
                  min={1990}
                  max={new Date().getFullYear() + 1}
                />
              </div>

              <div className="space-y-2">
                <Label>KM *</Label>
                <Input
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) || 0 })}
                  min={0}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Câmbio</Label>
                <Select
                  value={formData.transmission}
                  onValueChange={(v) => setFormData({ ...formData, transmission: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TRANSMISSION_TYPES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Combustível</Label>
                <Select
                  value={formData.fuel}
                  onValueChange={(v) => setFormData({ ...formData, fuel: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="Ex: Preto"
                />
              </div>

              <div className="space-y-2">
                <Label>Portas</Label>
                <Select
                  value={formData.doors.toString()}
                  onValueChange={(v) => setFormData({ ...formData, doors: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 portas</SelectItem>
                    <SelectItem value="4">4 portas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Final da Placa</Label>
                <Input
                  value={formData.plateEnding}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 1);
                    setFormData({ ...formData, plateEnding: value });
                  }}
                  placeholder="Ex: 5"
                  maxLength={1}
                  className="text-center"
                />
                <p className="text-xs text-muted-foreground">
                  Apenas o último dígito será exibido
                </p>
              </div>
            </div>

            {formData.listingType !== 'rental' && (
              <div className="space-y-2">
                <Label>Aceita troca?</Label>
                <Select
                  value={formData.acceptsTrade ? 'true' : 'false'}
                  onValueChange={(v) => setFormData({ ...formData, acceptsTrade: v === 'true' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Não</SelectItem>
                    <SelectItem value="true">Sim</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Preço (R$) *</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                min={0}
                step={100}
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva os diferenciais do veículo, opcionais, histórico..."
                rows={10}
                className="min-h-[220px] resize-y"
              />
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-card space-y-4">
            <h2 className="font-heading font-semibold">Localização e contato</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estado *</Label>
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
                <Label>Cidade *</Label>
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
              <Label>WhatsApp *</Label>
              <Input
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="11999999999"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={(e) => handleSubmit(e as any, true)}
              disabled={isLoading}
            >
              Salvar rascunho
            </Button>
            <Button
              type="submit"
              variant="kairos"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
               <>
                 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                 Enviando...
               </>
              ) : (
                'Enviar para aprovação'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
