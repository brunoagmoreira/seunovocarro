import { useRef } from 'react';
import Link from 'next/link';
import { 
  Handshake, 
  ShieldCheck, 
  PiggyBank, 
  MessageCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const banners = [
  {
    id: 1,
    title: "Compre direto do dono",
    subtitle: "Sem taxas de concessionária, sem intermediários",
    icon: Handshake,
    cta: "Ver veículos",
    href: "/veiculos",
    variant: 'gradient' as const,
  },
  {
    id: 2,
    title: "Vendedores verificados",
    subtitle: "Todos passam por aprovação antes de anunciar",
    icon: ShieldCheck,
    cta: "Saiba mais",
    href: "/sobre-kairos",
    variant: 'bordered' as const,
  },
  {
    id: 3,
    title: "Economize até 15%",
    subtitle: "Preços mais justos, sem repasse de taxas",
    icon: PiggyBank,
    cta: "Encontrar ofertas",
    href: "/veiculos?sort=price_asc",
    variant: 'badge' as const,
    badge: "ECONOMIA"
  },
  {
    id: 4,
    title: "Contato direto via WhatsApp",
    subtitle: "Negocie sem burocracia",
    icon: MessageCircle,
    cta: "Explorar",
    href: "/veiculos",
    variant: 'whatsapp' as const,
  },
];

export function BuyerBanners() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <section className="py-12 md:py-16 overflow-hidden">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold mb-1">
              Por que comprar aqui?
            </h2>
            <p className="text-muted-foreground">
              Vantagens exclusivas para você
            </p>
          </div>
          
          {/* Desktop navigation arrows */}
          <div className="hidden md:flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('left')}
              className="rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('right')}
              className="rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Banners Carousel - Mobile */}
        <div className="md:hidden -mx-4 px-4">
          <div 
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {banners.map((banner) => (
              <BannerCard key={banner.id} banner={banner} />
            ))}
          </div>
          
          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {banners.map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-muted-foreground/30"
              />
            ))}
          </div>
        </div>

        {/* Banners Grid - Desktop */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {banners.map((banner) => (
            <BannerCard key={banner.id} banner={banner} isGrid />
          ))}
        </div>
      </div>
    </section>
  );
}

interface BannerCardProps {
  banner: typeof banners[0];
  isGrid?: boolean;
}

function BannerCard({ banner, isGrid }: BannerCardProps) {
  const Icon = banner.icon;
  
  const getCardStyles = () => {
    switch (banner.variant) {
      case 'gradient':
        return 'bg-gradient-to-br from-primary/20 via-primary/10 to-emerald-500/10 border-primary/20';
      case 'bordered':
        return 'bg-card border-2 border-primary/30 hover:border-primary/50';
      case 'badge':
        return 'bg-card border border-border';
      case 'whatsapp':
        return 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20';
      default:
        return 'bg-card border border-border';
    }
  };

  const getIconStyles = () => {
    switch (banner.variant) {
      case 'gradient':
        return 'gradient-brand text-white';
      case 'whatsapp':
        return 'bg-emerald-500 text-white';
      default:
        return 'gradient-brand-soft text-primary';
    }
  };

  const content = (
    <>
      {/* Badge */}
      {banner.badge && (
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full gradient-brand text-white">
            {banner.badge}
          </span>
        </div>
      )}
      
      {/* Icon */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${getIconStyles()}`}>
        <Icon className="h-6 w-6" />
      </div>
      
      {/* Content */}
      <h3 className="font-heading font-bold text-lg mb-2 line-clamp-1">
        {banner.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {banner.subtitle}
      </p>
      
      {/* CTA */}
      <div className="mt-auto pt-2">
        <span className="inline-flex items-center text-sm font-medium text-primary group-hover:underline">
          {banner.cta}
          <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </>
  );

  const baseClasses = `
    group relative flex flex-col p-6 rounded-2xl border
    transition-all duration-300
    hover:shadow-lg hover:shadow-primary/5
    ${getCardStyles()}
  `;

  if (isGrid) {
    return (
      <Link 
        href={banner.href}
        className={`${baseClasses} h-full hover:scale-[1.02]`}
      >
        {content}
      </Link>
    );
  }

  return (
    <Link
      href={banner.href}
      className={`${baseClasses} min-w-[280px] max-w-[300px] snap-center shrink-0`}
    >
      {content}
    </Link>
  );
}
