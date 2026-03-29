"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  Share2, 
  MessageCircle,
  Gauge,
  Calendar,
  Fuel,
  Settings2,
  Palette,
  DoorOpen,
  CreditCard,
  MapPin,
  Expand
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useVehicleBySlug, useSellerVehicles } from '@/hooks/useVehicles';
import { VehicleCard } from '@/components/vehicles/VehicleCard';
import { useTrackView } from '@/hooks/useTrackView';
import { ImageLightbox } from '@/components/vehicles/ImageLightbox';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { ContactOptionsModal } from '@/components/vehicles/ContactOptionsModal';
import { ChatWindow } from '@/components/vehicles/ChatWindow';
import { useAuth } from '@/contexts/AuthContext';
import { FUEL_TYPES, TRANSMISSION_TYPES } from '@/types/vehicle';
import { Badge } from '@/components/ui/badge';
import { trackViewContent } from '@/lib/tracking';
import { VehicleSchema } from '@/components/seo/schemas';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export function VehicleClient({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const { user, isAdmin, isLoading: isAuthLoading } = useAuth();
  
  const isPreviewMode = searchParams.get('preview') === 'true';
  const allowAnyStatus = !isAuthLoading && isAdmin && isPreviewMode;
  
  const { data: vehicle, isLoading, error } = useVehicleBySlug(slug, allowAnyStatus);
  const { data: sellerVehicles } = useSellerVehicles(vehicle?.seller?.id, vehicle?.id);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Track page view
  useTrackView(vehicle?.id);

  // Track ViewContent event
  const hasTrackedViewContent = useRef(false);
  useEffect(() => {
    if (vehicle && !hasTrackedViewContent.current) {
      hasTrackedViewContent.current = true;
      trackViewContent({
        vehicleId: vehicle.id,
        vehicleName: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
        value: vehicle.price,
      });
    }
  }, [vehicle]);

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(price);
  }, []);

  const formatMileage = useCallback((mileage: number) => {
    return new Intl.NumberFormat('pt-BR').format(mileage);
  }, []);

  const breadcrumbItems = useMemo(() => {
    if (!vehicle) return [];
    return [
      { label: 'Veículos', href: '/veiculos' },
      { label: vehicle.brand, href: `/carros/${vehicle.brand.toLowerCase()}` },
      { label: `${vehicle.model} ${vehicle.year}` }
    ];
  }, [vehicle]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (showLightbox) return; 
    if (!vehicle || vehicle.images.length <= 1) return;
    
    if (e.key === 'ArrowRight') {
      setCurrentImageIndex((prev) => (prev + 1) % vehicle.images.length);
    } else if (e.key === 'ArrowLeft') {
      setCurrentImageIndex((prev) => (prev - 1 + vehicle.images.length) % vehicle.images.length);
    }
  }, [vehicle, showLightbox]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    if (!vehicle || vehicle.images.length <= 1) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setCurrentImageIndex((prev) => (prev + 1) % vehicle.images.length);
    }
    if (isRightSwipe) {
      setCurrentImageIndex((prev) => (prev - 1 + vehicle.images.length) % vehicle.images.length);
    }
  };

  if (isLoading || (isPreviewMode && isAuthLoading)) {
    return (
      <div className="min-h-screen pb-24 md:pb-8 pt-16">
        <div className="bg-muted">
          <Skeleton className="aspect-[4/3] md:aspect-[16/9] max-h-[70vh] w-full" />
        </div>
        <div className="container py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-3">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-10 w-1/3" />
              </div>
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
            <div className="hidden lg:block">
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="container py-32 text-center pt-32">
        <h1 className="font-heading text-2xl font-bold mb-4">Veículo não encontrado</h1>
        <Button asChild>
          <Link href="/veiculos">Ver todos os veículos</Link>
        </Button>
      </div>
    );
  }

  const allMedia = [...vehicle.images, ...vehicle.videos];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allMedia.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 pt-16">
      <VehicleSchema vehicle={vehicle} />
      
      <Breadcrumbs items={breadcrumbItems} />
      
      <div className="relative bg-muted">
        <div className="container max-w-4xl mx-auto">
          <div 
            className="aspect-[4/3] md:aspect-[16/9] relative overflow-hidden cursor-pointer" 
            onClick={() => setShowLightbox(true)}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {allMedia.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={allMedia[currentImageIndex]?.url}
                  alt={`${vehicle.brand} ${vehicle.model} - Foto ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  draggable={false}
                />
              </AnimatePresence>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <span className="text-muted-foreground">Sem imagem</span>
              </div>
            )}

            {allMedia.length > 0 && (
              <div className="absolute bottom-4 right-4 p-2 rounded-full bg-black/50 text-white">
                <Expand className="h-5 w-5" />
              </div>
            )}

            {allMedia.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors touch-target"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors touch-target"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {allMedia.length > 0 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/50 text-white text-sm">
                {currentImageIndex + 1} / {allMedia.length}
              </div>
            )}

            <div className="absolute top-4 left-4 right-4 flex justify-between">
              <Button 
                variant="ghost" 
                size="icon" 
                asChild
                className="bg-black/50 text-white hover:bg-black/70"
                onClick={(e) => e.stopPropagation()}
              >
                <Link href="/veiculos">
                  <ChevronLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="bg-black/50 text-white hover:bg-black/70"
                  onClick={(e) => { e.stopPropagation(); setIsFavorite(!isFavorite); }}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="bg-black/50 text-white hover:bg-black/70"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {allMedia.length > 1 && (
          <div className="container max-w-4xl mx-auto">
            <div className="flex gap-2 p-4 bg-card overflow-x-auto scrollbar-hide">
              {allMedia.map((media, index) => (
                <button
                  key={media.id || index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    index === currentImageIndex ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <OptimizedImage
                    src={media.url}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-full"
                    aspectRatio="1/1"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {vehicle.displayId && (
                  <Badge variant="secondary" className="font-mono text-sm bg-primary/10 text-primary">
                    {vehicle.displayId}
                  </Badge>
                )}
                <h1 className="font-heading text-2xl md:text-3xl font-bold">
                  {vehicle.brand} {vehicle.model}
                </h1>
              </div>
              <p className="text-muted-foreground mb-4">
                {vehicle.year} • {FUEL_TYPES[vehicle.fuel]} • {vehicle.color || 'Cor não informada'}
              </p>
              <div className="flex items-center gap-3">
                <span className="font-heading text-3xl md:text-4xl font-bold gradient-brand-text">
                  {formatPrice(vehicle.price)}
                </span>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-card">
              <h2 className="font-heading font-semibold text-lg mb-4">Especificações</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { icon: Gauge, label: 'Quilometragem', value: `${formatMileage(vehicle.mileage)} km` },
                  { icon: Settings2, label: 'Câmbio', value: TRANSMISSION_TYPES[vehicle.transmission] },
                  { icon: Calendar, label: 'Ano', value: vehicle.year },
                  { icon: Fuel, label: 'Combustível', value: FUEL_TYPES[vehicle.fuel] },
                  { icon: Palette, label: 'Cor', value: vehicle.color || '-' },
                  { icon: DoorOpen, label: 'Portas', value: vehicle.doors },
                  { icon: CreditCard, label: 'Final da placa', value: vehicle.plateEnding || '-' }
                ].map((spec) => (
                  <div key={spec.label} className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl gradient-brand-soft">
                      <spec.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{spec.label}</p>
                      <p className="font-semibold">{spec.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {vehicle.description && (
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <h2 className="font-heading font-semibold text-lg mb-4">Descrição</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {vehicle.description}
                </p>
              </div>
            )}

            <div className="bg-card rounded-2xl p-6 shadow-card">
              <h2 className="font-heading font-semibold text-lg mb-4">Localização</h2>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl gradient-brand-soft">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{vehicle.city}</p>
                  <p className="text-sm text-muted-foreground">{vehicle.state}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:block space-y-4">
            <div className="bg-card rounded-2xl p-6 shadow-card sticky top-20">
              <div className="flex items-center gap-4 mb-6">
                <OptimizedImage
                  src={vehicle.seller?.avatarUrl}
                  alt={vehicle.seller?.name || "Lojista"}
                  className="w-14 h-14 rounded-full"
                  aspectRatio="1/1"
                />
                <div>
                  <h3 className="font-heading font-semibold">{vehicle.seller?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {vehicle.seller?.city}, {vehicle.seller?.state}
                  </p>
                </div>
              </div>

              <Button 
                variant="kairos" 
                size="lg" 
                className="w-full text-base"
                onClick={() => setShowContactModal(true)}
              >
                <MessageCircle className="h-5 w-5 mr-2 shrink-0" />
                <span className="truncate">Falar Com o Vendedor</span>
              </Button>

              {showChat && user && vehicle.seller && (
                <div className="mt-4">
                  <ChatWindow
                    vehicleId={vehicle.id}
                    vehicleName={`${vehicle.brand} ${vehicle.model} ${vehicle.year}`}
                    sellerId={vehicle.seller.id}
                    sellerName={vehicle.seller.name}
                    sellerAvatar={vehicle.seller.avatarUrl}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
        
      {sellerVehicles && sellerVehicles.length > 0 && (
        <div className="container py-8 border-t border-border">
          <h2 className="font-heading text-xl md:text-2xl font-semibold mb-6">
            Outros veículos deste vendedor
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {sellerVehicles.slice(0, 4).map((v: any, i: number) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <VehicleCard vehicle={v} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="fixed bottom-16 left-0 right-0 p-4 bg-background/95 backdrop-blur-lg border-t border-border md:hidden safe-bottom">
        <div className="container">
          <Button 
            variant="kairos" 
            size="lg" 
            className="w-full text-base"
            onClick={() => setShowContactModal(true)}
          >
            <MessageCircle className="h-5 w-5 mr-2 shrink-0" />
            <span className="truncate">Falar Com o Vendedor</span>
          </Button>

          {showChat && user && vehicle.seller && (
            <div className="mt-4">
              <ChatWindow
                vehicleId={vehicle.id}
                vehicleName={`${vehicle.brand} ${vehicle.model} ${vehicle.year}`}
                sellerId={vehicle.seller.id}
                sellerName={vehicle.seller.name}
                sellerAvatar={vehicle.seller.avatarUrl}
              />
            </div>
          )}
        </div>
      </div>

      <ContactOptionsModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        vehicleId={vehicle.id}
        vehicleName={`${vehicle.brand} ${vehicle.model} ${vehicle.year}`}
        vehiclePrice={vehicle.price}
        sellerName={vehicle.seller?.name || "Vendedor"}
        sellerAvatar={vehicle.seller?.avatarUrl}
        sellerWhatsapp={vehicle.whatsapp || vehicle.seller?.whatsapp}
        onSelectChat={() => setShowChat(true)}
      />

      <ImageLightbox
        isOpen={showLightbox}
        onClose={() => setShowLightbox(false)}
        images={allMedia}
        currentIndex={currentImageIndex}
        onIndexChange={setCurrentImageIndex}
        alt={`${vehicle.brand} ${vehicle.model}`}
      />
    </div>
  );
}
