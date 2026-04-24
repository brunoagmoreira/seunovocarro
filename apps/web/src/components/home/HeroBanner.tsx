import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';
import { ShieldCheck, Zap, Clock, ChevronRight, ChevronLeft } from 'lucide-react';

interface FeaturedVehicleResponse {
  id: string;
  slug?: string;
  brand?: string;
  model?: string;
  version?: string;
  year?: number | string;
  price?: number | string;
  media?: Array<{
    url?: string;
    type?: string;
    order?: number;
  }>;
}

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string | null;
  linkUrl: string;
  priceLabel: string;
}

const defaultSlide: HeroSlide = {
  id: 'default',
  title: 'Carros verificados, perto de você.',
  subtitle: 'Veículos inspecionados de lojas confiáveis da região de Belo Horizonte. Sem surpresa, sem enrolação.',
  imageUrl: '',
  linkUrl: '/veiculos',
  priceLabel: '',
};

function formatPrice(value?: number | string) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return '';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(numeric);
}

function mapFeaturedToSlide(vehicle: FeaturedVehicleResponse): HeroSlide {
  const title = [vehicle.brand, vehicle.model, vehicle.version].filter(Boolean).join(' ').trim();
  const year = vehicle.year ? String(vehicle.year) : '';
  const image = vehicle.media?.find((item) => item.type === 'image' && item.url)?.url
    || vehicle.media?.find((item) => item.url)?.url
    || null;

  return {
    id: vehicle.id,
    title: title || 'Veículo em destaque',
    subtitle: year ? `Ano ${year}` : 'Veículo em destaque na plataforma',
    imageUrl: image,
    linkUrl: vehicle.slug ? `/veiculo/${vehicle.slug}` : '/veiculos',
    priceLabel: formatPrice(vehicle.price),
  };
}

export function HeroBanner() {
  const [slides, setSlides] = useState<HeroSlide[]>([defaultSlide]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const loadFeaturedVehicles = async () => {
      try {
        const data = await fetchApi<FeaturedVehicleResponse[]>('/vehicles/featured', {
          params: { limit: 12 },
        });
        if (data && data.length > 0) {
          setSlides(data.map(mapFeaturedToSlide));
        }
      } catch {
        console.error('Failed to load featured vehicles for hero');
      }
    };
    void loadFeaturedVehicles();
  }, []);

  // Auto Rotation
  useEffect(() => {
    if (slides.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000); // Roda a cada 5 segundos

    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const currentSlide = slides[currentIndex] || defaultSlide;

  const trustBadges = (
    <div className="flex flex-wrap items-center gap-4 pt-6 mt-4 border-t border-white/10">
      <div className="flex items-center gap-2">
        <div className="bg-[#FFD91A]/20 p-1.5 rounded-full">
          <ShieldCheck className="w-4 h-4 text-[#FFD91A]" />
        </div>
        <span className="text-white/90 text-sm font-medium">Lojas verificadas</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="bg-[#FFD91A]/20 p-1.5 rounded-full">
          <Zap className="w-4 h-4 text-[#FFD91A]" />
        </div>
        <span className="text-white/90 text-sm font-medium">Preço transparente</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="bg-[#FFD91A]/20 p-1.5 rounded-full">
          <Clock className="w-4 h-4 text-[#FFD91A]" />
        </div>
        <span className="text-white/90 text-sm font-medium">Atendimento rápido</span>
      </div>
    </div>
  );

  const destaqueButton = (
    <Link href={currentSlide.linkUrl} className="inline-block w-full sm:w-auto">
      <button className="bg-[#FFD91A] hover:bg-[#ffe34d] text-black font-bold py-4 px-8 rounded-full shadow-[0_8px_20px_-6px_rgba(255,217,26,0.5)] transition-all transform hover:scale-105 active:scale-95 text-lg w-full sm:w-auto">
        Ver Destaque
      </button>
    </Link>
  );

  return (
    <section className="relative bg-gradient-to-br from-[#268052] to-[#346739] overflow-hidden pt-12 pb-16 md:py-24">
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white to-transparent" />
      
      <div className="container relative z-10 px-4 mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          
          {/* Lado Esquerdo - Copywriting */}
          <div className="w-full lg:w-1/2 text-left z-20 space-y-6 animate-fade-in">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#FFD91A] animate-pulse mr-2"></span>
              <span className="text-white text-sm font-medium tracking-wide">📍 Belo Horizonte e região</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white leading-[1.1]">
              {defaultSlide.title}
            </h1>

            <p className="text-white/80 text-lg md:text-xl font-light leading-relaxed max-w-lg">
              {defaultSlide.subtitle}
            </p>

            {trustBadges}
          </div>

          {/* Lado Direito — nome à esquerda, foto sem moldura branca, Ver Destaque abaixo da foto */}
          <div className="w-full lg:w-1/2 relative z-10 flex flex-col items-stretch lg:items-end justify-start min-h-[220px] md:min-h-[280px]">
            {currentSlide.imageUrl ? (
              <div
                key={currentSlide.id}
                className="relative w-full max-w-[min(100%,25.2rem)] animate-fade-in flex flex-col text-left lg:ml-auto"
              >
                <div className="mb-3 w-full px-0">
                  <h2 className="text-left text-xl sm:text-2xl md:text-3xl font-heading font-bold text-white leading-snug text-balance">
                    {currentSlide.title}
                  </h2>
                  {currentSlide.subtitle ? (
                    <p className="text-left text-white/75 text-sm md:text-base mt-1">{currentSlide.subtitle}</p>
                  ) : null}
                </div>

                <div className="relative w-full overflow-hidden rounded-xl bg-white/5">
                  <Link href={currentSlide.linkUrl} className="relative block w-full">
                    <div
                      className="pointer-events-none absolute right-2 top-2 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-[#268052] text-white shadow-md md:h-9 md:w-9"
                      aria-hidden
                    >
                      <ShieldCheck className="h-4 w-4 md:h-[18px] md:w-[18px]" strokeWidth={2.25} />
                    </div>
                    <div className="flex min-h-[140px] items-center justify-center bg-gradient-to-b from-white/10 to-white/[0.03] md:min-h-[180px]">
                      <img
                        src={currentSlide.imageUrl}
                        alt={currentSlide.title}
                        loading="eager"
                        fetchPriority="high"
                        decoding="async"
                        className="max-h-[min(38vh,15rem)] w-full object-contain md:max-h-[min(42vh,17rem)]"
                      />
                    </div>
                  </Link>
                  {currentSlide.priceLabel ? (
                    <div className="pointer-events-none absolute bottom-3 left-3 z-20 rounded-lg bg-neutral-900/85 px-3 py-2 backdrop-blur-sm md:bottom-4 md:left-4 md:px-4 md:py-2.5">
                      <p className="text-sm font-bold tabular-nums text-[#FFD91A] md:text-base">{currentSlide.priceLabel}</p>
                    </div>
                  ) : null}
                </div>

                <div className="mt-4 w-full">{destaqueButton}</div>
              </div>
            ) : (
              <div className="flex w-full max-w-lg flex-col text-left lg:ml-auto">
                <div className="aspect-video w-full rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm flex items-center justify-center px-4">
                  <span className="text-left text-white/30 font-medium text-sm">
                    Adicione a foto do carro no Admin
                  </span>
                </div>
                <div className="mt-4">{destaqueButton}</div>
              </div>
            )}
          </div>
        </div>

        {/* Controles fora do fluxo absoluto da imagem — evita cobrir o preço no mobile */}
        {slides.length > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8 md:mt-10 w-full bg-black/20 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/10 max-w-md mx-auto">
            <button
              type="button"
              aria-label="Slide anterior"
              onClick={prevSlide}
              className="text-white/80 hover:text-white transition-colors p-1 touch-target min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex gap-2 items-center">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Ir para o slide ${idx + 1}`}
                  aria-current={idx === currentIndex ? 'true' : undefined}
                  onClick={() => setCurrentIndex(idx)}
                  className={`rounded-full transition-all p-3 -m-1 flex items-center justify-center ${
                    idx === currentIndex ? 'bg-[#FFD91A] h-2 w-6' : 'bg-white/30 hover:bg-white/50 w-2 h-2'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Próximo slide"
              onClick={nextSlide}
              className="text-white/80 hover:text-white transition-colors p-1 touch-target min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
