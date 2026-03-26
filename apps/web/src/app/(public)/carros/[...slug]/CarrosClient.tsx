"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Car, Filter, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { VehicleCard } from '@/components/vehicles/VehicleCard';
import { InternalLinks } from '@/components/seo/InternalLinks';
import { BRAND_CONTENT, LOCATION_CONTENT, POPULAR_BRANDS, POPULAR_CITIES } from '@/data/brandContent';
import { STATES } from '@/types/vehicle';
import { useVehicles } from '@/hooks/useVehicles';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

function formatCityName(city: string): string {
  return city
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// === BRAND PAGE CLIENT ===
function BrandPageClient({ brand }: { brand: string }) {
  const brandNormalized = brand.toLowerCase();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [brandNormalized]);

  const brandDisplay = POPULAR_BRANDS.find(
    b => b.toLowerCase() === brandNormalized
  ) || (brand ? brand.charAt(0).toUpperCase() + brand.slice(1) : '');

  const { data: vehiclesData, isLoading } = useVehicles({ 
    brand: brandNormalized 
  });
  const vehicles = vehiclesData?.data || [];

  const brandContent = BRAND_CONTENT[brandNormalized];
  const vehicleCount = vehicles.length || 0;
  const minPrice = vehicles.length 
    ? Math.min(...vehicles.map(v => v.price))
    : 0;

  const breadcrumbItems = [
    { label: 'Veículos', href: '/veiculos' },
    { label: brandDisplay },
  ];

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container py-8">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Car className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="font-heading text-3xl md:text-4xl font-bold">
                  {brandDisplay} Usados e Seminovos
                </h1>
                <p className="text-muted-foreground mt-1">
                  {vehicleCount} veículos disponíveis
                  {minPrice > 0 && ` • A partir de R$ ${minPrice.toLocaleString('pt-BR')}`}
                </p>
              </div>
            </div>

            {brandContent && (
              <div className="mt-6 prose prose-lg max-w-none text-muted-foreground">
                <p>{brandContent.intro}</p>
                {brandContent.history && (
                  <p className="mt-4">{brandContent.history}</p>
                )}
              </div>
            )}

            {brandContent?.popularModels && (
              <div className="mt-6">
                <h2 className="font-heading font-semibold text-lg mb-3">
                  Modelos Populares
                </h2>
                <div className="flex flex-wrap gap-2">
                  {brandContent.popularModels.map((model) => (
                    <span
                      key={model}
                      className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                    >
                      {model}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-heading text-2xl font-bold">
            {brandDisplay} à Venda
          </h2>
          <Link
            href={`/veiculos?brand=${brandNormalized}`}
            className="flex items-center gap-2 text-primary hover:underline"
          >
            <Filter className="h-4 w-4" />
            Filtrar
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-[400px] rounded-2xl" />
            ))}
          </div>
        ) : vehicles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Car className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-heading text-xl font-semibold mb-2">
              Nenhum {brandDisplay} disponível
            </h3>
            <p className="text-muted-foreground mb-6">
              No momento não temos veículos desta marca. Confira outras opções!
            </p>
            <Link
              href="/veiculos"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Ver Todos os Veículos
            </Link>
          </div>
        )}
      </section>

      {brandContent?.faq && brandContent.faq.length > 0 && (
        <section className="bg-muted/50 py-12">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-2xl font-bold mb-8">
              Perguntas Frequentes sobre {brandDisplay}
            </h2>
            <Accordion type="single" collapsible className="max-w-3xl">
              {brandContent.faq.map((item, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left font-medium">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      )}

      <InternalLinks type="all" currentBrand={brandNormalized} hasVehicles={vehicleCount > 0} />
    </div>
  );
}

// === LOCATION PAGE CLIENT ===
function LocationPageClient({ state, city }: { state: string; city: string }) {
  const stateNormalized = state.toUpperCase();
  const cityNormalized = city.toLowerCase();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [stateNormalized, cityNormalized]);
  
  const stateData = STATES.find(s => s.uf === stateNormalized);
  const stateName = stateData?.name || stateNormalized;
  
  const cityDisplay = cityNormalized ? formatCityName(cityNormalized) : '';
  const knownCity = POPULAR_CITIES.find(
    c => c.city === cityNormalized && c.state === stateNormalized
  );
  const finalCityName = knownCity?.name || cityDisplay;

  // Replaces the direct supabase query with our hook abstraction
  const { data: vehiclesData, isLoading } = useVehicles({ 
    state: stateNormalized,
    city: cityNormalized ? citySearchTransform(cityNormalized) : undefined
  });
  const vehicles = vehiclesData?.data || [];

  function citySearchTransform(slug: string) {
    return slug.split('-').join(' ');
  }

  const locationContent = LOCATION_CONTENT[stateNormalized.toLowerCase()];
  const vehicleCount = vehicles.length || 0;
  const locationName = cityNormalized ? `${finalCityName}, ${stateNormalized}` : stateName;

  const breadcrumbItems = [
    { label: 'Veículos', href: '/veiculos' },
    ...(cityNormalized 
      ? [
          { label: stateName, href: `/carros/${stateNormalized.toLowerCase()}` },
          { label: finalCityName },
        ]
      : [{ label: stateName }]
    ),
  ];

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container py-8">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <section className="bg-gradient-to-br from-secondary/10 via-background to-primary/10 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-secondary-foreground" />
              </div>
              <div>
                <h1 className="font-heading text-3xl md:text-4xl font-bold">
                  Carros Usados em {locationName}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {vehicleCount} veículos disponíveis na região
                </p>
              </div>
            </div>

            {locationContent && (
              <div className="mt-6 prose prose-lg max-w-none text-muted-foreground">
                <p>{locationContent.intro}</p>
              </div>
            )}

            {locationContent?.highlights && (
              <div className="mt-6">
                <h2 className="font-heading font-semibold text-lg mb-3">
                  Por que comprar em {locationName}?
                </h2>
                <ul className="flex flex-wrap gap-3">
                  {locationContent.highlights.map((highlight, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm"
                    >
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <h2 className="font-heading text-2xl font-bold mb-8">
          Veículos em {locationName}
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-[400px] rounded-2xl" />
            ))}
          </div>
        ) : vehicles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Car className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-heading text-xl font-semibold mb-2">
              Nenhum veículo disponível em {locationName}
            </h3>
            <p className="text-muted-foreground mb-6">
              No momento não temos veículos nesta região. Confira outras cidades!
            </p>
            <Link
              href="/veiculos"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Ver Todos os Veículos
            </Link>
          </div>
        )}
      </section>

      {!cityNormalized && (
        <section className="bg-muted/50 py-12">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-2xl font-bold mb-6">
              Cidades em {stateName}
            </h2>
            <div className="flex flex-wrap gap-3">
              {POPULAR_CITIES
                .filter(c => c.state === stateNormalized)
                .map((loc) => (
                  <Link
                    key={loc.city}
                    href={`/carros/${stateNormalized.toLowerCase()}/${loc.city}`}
                    className="px-4 py-2 rounded-full bg-background border border-border hover:border-primary hover:text-primary transition-colors"
                  >
                    {loc.name}
                  </Link>
                ))}
            </div>
          </div>
        </section>
      )}

      <InternalLinks type="all" currentCity={cityNormalized} hasVehicles={vehicleCount > 0} />
    </div>
  );
}

// === BRAND + LOCATION PAGE CLIENT ===
function BrandLocationPageClient({ brand, state, city }: { brand: string; state: string; city: string }) {
  const brandNormalized = brand.toLowerCase();
  const stateNormalized = state.toUpperCase();
  const cityNormalized = city.toLowerCase();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [brandNormalized, stateNormalized, cityNormalized]);
  
  const brandDisplay = POPULAR_BRANDS.find(
    b => b.toLowerCase() === brandNormalized
  ) || (brand ? brand.charAt(0).toUpperCase() + brand.slice(1) : '');
  
  const stateData = STATES.find(s => s.uf === stateNormalized);
  const stateName = stateData?.name || stateNormalized;
  
  const knownCity = POPULAR_CITIES.find(
    c => c.city === cityNormalized && c.state === stateNormalized
  );
  const cityDisplay = knownCity?.name || formatCityName(cityNormalized);

  function citySearchTransform(slug: string) {
    return slug.split('-').join(' ');
  }

  const { data: vehiclesData, isLoading } = useVehicles({ 
    brand: brandNormalized,
    state: stateNormalized,
    city: citySearchTransform(cityNormalized)
  });
  const vehicles = vehiclesData?.data || [];

  const vehicleCount = vehicles.length || 0;

  const breadcrumbItems = [
    { label: brandDisplay, href: `/carros/${brandNormalized}` },
    { label: stateName, href: `/carros/${stateNormalized.toLowerCase()}` },
    { label: cityDisplay },
  ];

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container py-8">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Car className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="font-heading text-3xl md:text-4xl font-bold">
                  {brandDisplay} Usados em {cityDisplay}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {vehicleCount} veículos disponíveis em {cityDisplay}, {stateNormalized}
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-6 text-muted-foreground text-lg">
              Encontre o {brandDisplay} ideal em {cityDisplay}. Todos os veículos são de vendedores verificados, 
              com fotos reais e informações detalhadas para você fazer a melhor escolha.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <h2 className="font-heading text-2xl font-bold mb-8">
          {brandDisplay} à Venda em {cityDisplay}
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-[400px] rounded-2xl" />
            ))}
          </div>
        ) : vehicles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Car className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-heading text-xl font-semibold mb-2">
              Nenhum {brandDisplay} disponível em {cityDisplay}
            </h3>
            <p className="text-muted-foreground mb-6">
              Veja outras opções de {brandDisplay} em outras cidades ou confira outros modelos.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href={`/carros/${brandNormalized}`}
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                Ver Todos os {brandDisplay}
              </Link>
              <Link
                href={`/carros/${stateNormalized.toLowerCase()}/${cityNormalized}`}
                className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-border font-medium hover:bg-muted transition-colors"
              >
                Ver Carros em {cityDisplay}
              </Link>
            </div>
          </div>
        )}
      </section>

      <section className="bg-muted/50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-xl font-bold mb-6">
            Você também pode gostar
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/carros/${brandNormalized}`}
              className="px-4 py-2 rounded-full bg-background border border-border hover:border-primary hover:text-primary transition-colors"
            >
              Todos {brandDisplay}
            </Link>
            <Link
              href={`/carros/${stateNormalized.toLowerCase()}/${cityNormalized}`}
              className="px-4 py-2 rounded-full bg-background border border-border hover:border-primary hover:text-primary transition-colors"
            >
              Carros em {cityDisplay}
            </Link>
            <Link
              href={`/carros/${stateNormalized.toLowerCase()}`}
              className="px-4 py-2 rounded-full bg-background border border-border hover:border-primary hover:text-primary transition-colors"
            >
              Carros em {stateName}
            </Link>
          </div>
        </div>
      </section>

      <InternalLinks type="all" currentBrand={brandNormalized} currentCity={cityNormalized} hasVehicles={vehicleCount > 0} />
    </div>
  );
}

// === MAIN ROUTER ===
export function CarrosClient({ slug }: { slug: string[] }) {
  if (!slug || slug.length === 0) return null;

  // 1. /carros/:brand (e.g., /carros/fiat)
  if (slug.length === 1) {
    return <BrandPageClient brand={slug[0]} />;
  }
  
  // 2. /carros/:state/:city (e.g., /carros/sp/sao-paulo)
  if (slug.length === 2) {
    return <LocationPageClient state={slug[0]} city={slug[1]} />;
  }

  // 3. /carros/:brand/:state/:city (e.g., /carros/fiat/sp/sao-paulo)
  if (slug.length === 3) {
    return <BrandLocationPageClient brand={slug[0]} state={slug[1]} city={slug[2]} />;
  }

  return <div className="p-8 text-center pt-32">Parâmetros inválidos.</div>;
}
