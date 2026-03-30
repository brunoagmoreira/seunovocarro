import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';
import { ShieldCheck, Zap, Clock, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
  order: number;
}

export function HeroBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const data = await fetchApi<Banner[]>('/banners/active');
        if (data && data.length > 0) {
          setBanners(data);
        } else {
          // Fallback Default Banner from Briefing
          setBanners([{
            id: 'default',
            title: 'Carros verificados, perto de você.',
            subtitle: 'Veículos inspecionados de lojas confiáveis da região de Belo Horizonte. Sem surpresa, sem enrolação.',
            image_url: '', // Fallback vazio para mostrar placeholder
            link_url: '/veiculos',
            order: 0
          }]);
        }
      } catch (error) {
        console.error('Failed to load banners');
      }
    };
    loadBanners();
  }, []);

  // Auto Rotation
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 5000); // Roda a cada 5 segundos

    return () => clearInterval(interval);
  }, [banners.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

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
              {currentBanner.title || 'Carros verificados, perto de você.'}
            </h1>

            <p className="text-white/80 text-lg md:text-xl font-light leading-relaxed max-w-lg">
              {currentBanner.subtitle || 'Veículos inspecionados de lojas confiáveis. Sem surpresa, sem enrolação.'}
            </p>

            <div className="pt-2">
              <Link href={currentBanner.link_url || '/veiculos'}>
                <button className="bg-[#FFD91A] hover:bg-[#ffe34d] text-black font-bold py-4 px-8 rounded-full shadow-[0_8px_20px_-6px_rgba(255,217,26,0.5)] transition-all transform hover:scale-105 active:scale-95 text-lg">
                  Ver ofertas disponíveis
                </button>
              </Link>
            </div>

            {/* Trust Badges */}
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
          </div>

          {/* Lado Direito - Carro Verificado */}
          <div className="w-full lg:w-1/2 relative z-10 flex justify-center lg:justify-end min-h-[300px] md:min-h-[400px]">
            {currentBanner.image_url ? (
              <div className="relative w-full max-w-2xl animate-fade-in">
                {/* O Badge de Verificação sobreposto ao carro */}
                <div className="absolute -top-4 -right-4 md:top-4 md:right-8 z-30 bg-[#FFD91A] w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-xl border-4 border-white transform rotate-12 hover:rotate-0 transition-transform">
                  <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-black" />
                </div>
                <img 
                  src={currentBanner.image_url} 
                  alt="Veículo Verificado" 
                  className="w-full h-auto object-contain drop-shadow-2xl scale-110" 
                />
              </div>
            ) : (
              // Empty State visual elegante
              <div className="w-full max-w-lg aspect-video bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <span className="text-white/30 font-medium">Adicione a foto do carro no Admin</span>
              </div>
            )}
          </div>

        </div>

        {/* Carousel Controls */}
        {banners.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-40 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <button onClick={prevSlide} className="text-white/70 hover:text-white transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex gap-2">
              {banners.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-[#FFD91A] w-6' : 'bg-white/30 hover:bg-white/50'}`}
                />
              ))}
            </div>
            <button onClick={nextSlide} className="text-white/70 hover:text-white transition-colors">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
