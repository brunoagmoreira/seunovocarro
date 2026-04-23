"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Car, Shield, Users } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { VehicleCard } from '@/components/vehicles/VehicleCard';
import { SearchFilters } from '@/components/vehicles/SearchFilters';

// Components
import { HeroBanner } from '@/components/home/HeroBanner';
import { BuyerBanners } from '@/components/home/BuyerBanners';
import { TrustBadges } from '@/components/home/TrustBadges';

import { useFeaturedVehicles, useVehicleCount } from '@/hooks/useVehicles';
import { useUTM } from '@/hooks/useUTM';
import { VehicleFilters } from '@/types/vehicle';
import { Skeleton } from '@/components/ui/skeleton';
import { OrganizationSchema, WebsiteSearchSchema, LocalBusinessSchema } from '@/components/seo/schemas';

const HomeBlogSection = dynamic(
  () => import('@/components/home/HomeBlogSection').then((mod) => mod.HomeBlogSection),
  {
    loading: () => (
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl overflow-hidden border">
                <Skeleton className="aspect-video w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
  },
);

const HomeDealersSection = dynamic(
  () => import('@/components/home/HomeDealersSection').then((mod) => mod.HomeDealersSection),
  {
    loading: () => (
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    ),
  },
);

const HomeFaqSection = dynamic(
  () => import('@/components/home/HomeFaqSection').then((mod) => mod.HomeFaqSection),
);

export function HomeClient() {
  const router = useRouter();
  const [filters, setFilters] = useState<VehicleFilters>({});
  
  const { data: featuredVehicles, isLoading } = useFeaturedVehicles();
  useVehicleCount();
  
  // Capture UTM params on page load
  useUTM();

  const handleSearch = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, String(value));
    });
    router.push(`/veiculos?${params.toString()}`);
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Schemas handled client-side or moving to server-side metadata later. We keep them here for now */}
      <OrganizationSchema />
      <WebsiteSearchSchema />
      <LocalBusinessSchema />

      <HeroBanner />

      <section className="bg-background border-b border-border py-6 shadow-sm relative z-20 -mt-6 rounded-t-3xl md:rounded-t-none md:-mt-0">
        <div className="container max-w-5xl mx-auto">
          <SearchFilters 
            filters={filters}
            onFilterChange={setFilters}
            onSearch={handleSearch}
            variant="hero"
          />
        </div>
      </section>

      <section className="py-12 md:py-16 border-y border-border bg-card/50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: Car,
                title: 'Veículos verificados',
                description: 'Todos os anúncios passam por aprovação da nossa equipe'
              },
              {
                icon: Shield,
                title: 'Compra segura',
                description: 'Contato direto com vendedores verificados'
              },
              {
                icon: Users,
                title: 'Multi-vendedor',
                description: 'Diversos vendedores em um só lugar'
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="flex items-start gap-4"
              >
                <div className="p-3 rounded-xl gradient-brand-soft">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BuyerBanners />

      <section className="py-12 md:py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold mb-1">
                Veículos em destaque
              </h2>
              <p className="text-muted-foreground">
                Selecionados especialmente para você
              </p>
            </div>
            <Button variant="ghost" asChild className="hidden md:flex">
              <Link href="/veiculos">
                Ver todos
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden bg-card">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-6 w-1/3" />
                  </div>
                </div>
              ))
            ) : featuredVehicles && featuredVehicles.length > 0 ? (
              featuredVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle as any} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">Nenhum veículo disponível no momento.</p>
                <Button variant="outline" asChild className="mt-4">
                  <Link href="/anunciar">Seja o primeiro a anunciar</Link>
                </Button>
              </div>
            )}
          </div>

          <div className="mt-6 md:hidden">
            <Button variant="outline" asChild className="w-full">
              <Link href="/veiculos">
                Ver todos os veículos
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <TrustBadges />

      <HomeBlogSection />
      <HomeDealersSection />
      <HomeFaqSection />

      <section className="py-12 md:py-16">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl gradient-brand p-8 md:p-12 text-center">
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="font-heading text-2xl md:text-4xl font-bold text-white mb-4">
                Quer vender seu carro?
              </h2>
              <p className="text-white/80 mb-6 md:mb-8">
                Anuncie gratuitamente e alcance milhares de compradores
              </p>
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90"
                asChild
              >
                <Link href="/anunciar">
                  Anunciar agora
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </div>
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>
        </div>
      </section>
    </div>
  );
}
