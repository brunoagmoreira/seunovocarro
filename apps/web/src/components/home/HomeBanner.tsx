import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useBanners } from '@/hooks/useBanners';
import { Button } from '@/components/ui/button';

export function HomeBanner() {
  const { data: banners = [] } = useBanners();
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeBanners = banners.filter(b => b.is_active);

  useEffect(() => {
    if (activeBanners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  const currentBanner = activeBanners[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const BannerContent = () => {
    if (currentBanner.type === 'image' && currentBanner.image_url) {
      return (
        <div className="relative w-full h-full flex items-center justify-center bg-background">
          <img
            src={currentBanner.image_url}
            alt={currentBanner.title || 'Banner'}
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
        </div>
      );
    }

    return (
      <div className="relative w-full h-full gradient-kairos flex items-center justify-center px-6">
        <div className="text-center text-white">
          {currentBanner.title && (
            <h3 className="font-heading text-xl md:text-2xl font-bold mb-2">
              {currentBanner.title}
            </h3>
          )}
          {currentBanner.subtitle && (
            <p className="text-white/80 text-sm md:text-base">
              {currentBanner.subtitle}
            </p>
          )}
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>
    );
  };

  const bannerElement = currentBanner.link_url ? (
    <Link href={currentBanner.link_url} className="block w-full h-full cursor-pointer">
      <BannerContent />
    </Link>
  ) : (
    <BannerContent />
  );

  return (
    <section className="py-6 md:py-8">
      <div className="w-full">
        <div className="relative overflow-hidden h-32 md:h-56 w-full">
          {/* Simple fade transition using CSS */}
          <div 
            key={currentIndex} 
            className="w-full h-full animate-fade-in"
          >
            {bannerElement}
          </div>

          {/* Navigation Arrows */}
          {activeBanners.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full h-8 w-8"
                onClick={(e) => {
                  e.preventDefault();
                  handlePrev();
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full h-8 w-8"
                onClick={(e) => {
                  e.preventDefault();
                  handleNext();
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Dots Indicator */}
          {activeBanners.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {activeBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
