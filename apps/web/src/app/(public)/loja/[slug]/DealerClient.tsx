"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  MapPin, Phone, Clock,   Globe, 
  Shield, BadgeCheck, Calendar, Car, MessageCircle, Store,
  Filter, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { VehicleCard } from '@/components/vehicles/VehicleCard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { useDealer, useDealerVehicles } from '@/hooks/useDealers';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
} from '@/components/ui/collapsible';

export function DealerClient({ slug }: { slug: string }) {
  const { data: dealer, isLoading: loadingDealer } = useDealer(slug);
  const { data: vehicles, isLoading: loadingVehicles } = useDealerVehicles(dealer?.id);
  
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [showFilters, setShowFilters] = useState(false);
  
  const { brands, years, filteredVehicles } = useMemo(() => {
    if (!vehicles) return { brands: [], years: [], filteredVehicles: [] };
    
    const brandsSet = new Set(vehicles.map((v: any) => v.brand));
    const yearsSet = new Set(vehicles.map((v: any) => v.year.toString()));
    
    let filtered = [...vehicles];
    
    if (selectedBrand !== 'all') {
      filtered = filtered.filter((v: any) => v.brand === selectedBrand);
    }
    if (selectedYear !== 'all') {
      filtered = filtered.filter((v: any) => v.year.toString() === selectedYear);
    }
    
    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'year-desc') {
      filtered.sort((a, b) => b.year - a.year);
    } else if (sortBy === 'mileage-asc') {
      filtered.sort((a, b) => a.mileage - b.mileage);
    }
    
    return {
      brands: Array.from(brandsSet).sort() as string[],
      years: Array.from(yearsSet).sort((a: any, b: any) => Number(b) - Number(a)) as string[],
      filteredVehicles: filtered
    };
  }, [vehicles, selectedBrand, selectedYear, sortBy]);
  
  const hasActiveFilters = selectedBrand !== 'all' || selectedYear !== 'all';
  
  const clearFilters = () => {
    setSelectedBrand('all');
    setSelectedYear('all');
  };

  if (loadingDealer) {
    return <DealerPageSkeleton />;
  }

  if (!dealer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center px-6">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-muted flex items-center justify-center">
            <Store className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="font-heading text-2xl font-bold mb-4">Lojista não encontrado</h1>
          <p className="text-muted-foreground mb-6">
            A loja que você está procurando não existe ou foi removida.
          </p>
          <Button variant="brand" asChild>
            <Link href="/veiculos">Ver todos os veículos</Link>
          </Button>
        </div>
      </div>
    );
  }

  const vehicleCount = vehicles?.length || 0;

  const breadcrumbItems = [
    { label: 'Início', href: '/' },
    { label: 'Lojas', href: '/lojas' },
    { label: dealer.dealer_name }
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-8 pt-16">
      <DealerLocalBusinessSchema dealer={dealer} />

      <div className="relative h-48 md:h-64 bg-gradient-to-r from-primary/20 to-primary/5 overflow-hidden">
        {dealer.dealer_banner && (
          <img
            src={dealer.dealer_banner}
            alt={`Banner ${dealer.dealer_name}`}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 right-4"
        >
          <Badge className="gradient-brand text-white border-0 px-3 py-1.5">
            <Shield className="h-3.5 w-3.5 mr-1.5" />
            Parceiro Seu Novo Carro
          </Badge>
        </motion.div>
      </div>

      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="-mt-16 relative z-10 mb-8"
        >
          <div className="bg-card rounded-2xl shadow-card p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white shadow-lg overflow-hidden border-4 border-background">
                  {dealer.dealer_logo ? (
                    <img
                      src={dealer.dealer_logo}
                      alt={dealer.dealer_name}
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <div className="w-full h-full gradient-brand flex items-center justify-center">
                      <span className="text-3xl md:text-4xl font-bold text-white">
                        {dealer.dealer_name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="font-heading text-2xl md:text-3xl font-bold">
                        {dealer.dealer_name}
                      </h1>
                      {dealer.dealer_verified && (
                        <BadgeCheck className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-sm mb-3">
                      {dealer.city && dealer.state && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {dealer.city}, {dealer.state}
                        </span>
                      )}
                      {dealer.dealer_since && (
                        <>
                          <span className="hidden md:inline">•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Na Seu Novo Carro desde {new Date(dealer.dealer_since).getFullYear()}
                          </span>
                        </>
                      )}
                    </div>

                    {dealer.dealer_description && (
                      <p className="text-muted-foreground max-w-2xl">
                        {dealer.dealer_description}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-6 md:gap-8">
                    <div className="text-center">
                      <span className="block text-2xl md:text-3xl font-bold gradient-brand-text">
                        {vehicleCount}
                      </span>
                      <span className="text-xs text-muted-foreground">veículos</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-border">
              {dealer.whatsapp && (
                <Button variant="brand" size="sm" asChild>
                  <a
                    href={`https://wa.me/55${dealer.whatsapp.replace(/\D/g, '')}?text=Olá! Vi sua loja na Seu Novo Carro e gostaria de saber mais.`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </a>
                </Button>
              )}
              {dealer.phone && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`tel:${dealer.phone}`}>
                    <Phone className="h-4 w-4 mr-2" />
                    Ligar
                  </a>
                </Button>
              )}
              {dealer.dealer_instagram && (
                <Button variant="ghost" size="icon" asChild>
                  <a
                    href={`https://instagram.com/${dealer.dealer_instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Globe className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {dealer.dealer_facebook && (
                <Button variant="ghost" size="icon" asChild>
                  <a href={dealer.dealer_facebook} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {dealer.dealer_website && (
                <Button variant="ghost" size="icon" asChild>
                  <a href={dealer.dealer_website} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        <Breadcrumbs items={breadcrumbItems} className="mb-6" />

        <section className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="font-heading text-xl md:text-2xl font-semibold">
              Veículos de {dealer.dealer_name}
              <span className="text-muted-foreground font-normal text-base ml-2">
                ({filteredVehicles.length} {filteredVehicles.length === 1 ? 'veículo' : 'veículos'})
              </span>
            </h2>
            
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Mais recentes</SelectItem>
                  <SelectItem value="price-asc">Menor preço</SelectItem>
                  <SelectItem value="price-desc">Maior preço</SelectItem>
                  <SelectItem value="year-desc">Mais novos</SelectItem>
                  <SelectItem value="mileage-asc">Menor km</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant={showFilters ? "secondary" : "outline"} 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtros
                {hasActiveFilters && (
                  <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {(selectedBrand !== 'all' ? 1 : 0) + (selectedYear !== 'all' ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
          
          <Collapsible open={showFilters} onOpenChange={setShowFilters}>
            <CollapsibleContent>
              <div className="bg-card rounded-xl p-4 mb-6 border border-border">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-[150px]">
                    <label className="text-xs text-muted-foreground mb-1 block">Marca</label>
                    <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as marcas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as marcas</SelectItem>
                        {brands.map(brand => (
                          <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex-1 min-w-[120px]">
                    <label className="text-xs text-muted-foreground mb-1 block">Ano</label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os anos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os anos</SelectItem>
                        {years.map(year => (
                          <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {hasActiveFilters && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearFilters}
                      className="text-muted-foreground mt-4"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Limpar
                    </Button>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {loadingVehicles ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
              ))}
            </div>
          ) : filteredVehicles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredVehicles.map((vehicle: any, i: number) => (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <VehicleCard vehicle={vehicle} />
                </motion.div>
              ))}
            </div>
          ) : vehicles && vehicles.length > 0 ? (
            <div className="text-center py-12 bg-card rounded-2xl">
              <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-3">
                Nenhum veículo encontrado com esses filtros.
              </p>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Limpar filtros
              </Button>
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-2xl">
              <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum veículo disponível no momento.
              </p>
            </div>
          )}
        </section>

        {(dealer.dealer_address || dealer.dealer_working_hours) && (
          <section className="mb-12">
            <div className="grid md:grid-cols-2 gap-6">
              {dealer.dealer_address && (
                <div className="bg-card rounded-2xl p-6 shadow-card">
                  <h3 className="font-heading font-semibold flex items-center gap-2 mb-4">
                    <MapPin className="h-5 w-5 text-primary" />
                    Endereço
                  </h3>
                  <p className="text-muted-foreground">{dealer.dealer_address}</p>
                </div>
              )}
              {dealer.dealer_working_hours && (
                <div className="bg-card rounded-2xl p-6 shadow-card">
                  <h3 className="font-heading font-semibold flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-primary" />
                    Horário de Funcionamento
                  </h3>
                  <div className="space-y-1">
                    {Object.entries(dealer.dealer_working_hours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{day}:</span>
                        <span>{hours as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="mb-8">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
              <div className="p-3 rounded-xl gradient-brand">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg">
                  Lojista Parceiro Seu Novo Carro
                </h3>
                <p className="text-muted-foreground text-sm">
                  Verificado e aprovado pela nossa equipe
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <BadgeCheck className="h-4 w-4 text-primary" />
                Documentação verificada
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BadgeCheck className="h-4 w-4 text-primary" />
                Histórico de vendas
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BadgeCheck className="h-4 w-4 text-primary" />
                Atendimento monitorado
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function DealerPageSkeleton() {
  return (
    <div className="min-h-screen pb-24 md:pb-8 pt-16">
      <Skeleton className="h-48 md:h-64 w-full" />
      <div className="container">
        <div className="-mt-16 relative z-10 mb-8">
          <div className="bg-card rounded-2xl shadow-card p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-2xl" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

function DealerLocalBusinessSchema({ dealer }: { dealer: any }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "name": dealer.dealer_name,
    "description": dealer.dealer_description,
    "url": `https://seunovocarro.com.br/loja/${dealer.dealer_slug}`,
    "logo": dealer.dealer_logo,
    "image": dealer.dealer_banner,
    "telephone": dealer.phone,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": dealer.city,
      "addressRegion": dealer.state,
      "addressCountry": "BR",
      "streetAddress": dealer.dealer_address
    },
    "openingHoursSpecification": dealer.dealer_working_hours ? 
      Object.entries(dealer.dealer_working_hours).map(([day, hours]) => ({
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": day,
        "opens": (hours as string).split('-')[0]?.trim(),
        "closes": (hours as string).split('-')[1]?.trim()
      })) : undefined,
    "sameAs": [
      dealer.dealer_instagram ? `https://instagram.com/${dealer.dealer_instagram}` : null,
      dealer.dealer_facebook,
      dealer.dealer_website
    ].filter(Boolean)
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
