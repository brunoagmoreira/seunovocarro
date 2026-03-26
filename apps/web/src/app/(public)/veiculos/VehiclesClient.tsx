"use client";

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VehicleCard } from '@/components/vehicles/VehicleCard';
import { SidebarFilters } from '@/components/vehicles/SidebarFilters';
import { MobileFiltersSheet } from '@/components/vehicles/MobileFiltersSheet';
import { useVehicles } from '@/hooks/useVehicles';
import { useUTM } from '@/hooks/useUTM';
import { VehicleFilters, SortOption, STATES } from '@/types/vehicle';
import { Skeleton } from '@/components/ui/skeleton';
import { ItemListSchema } from '@/components/seo/schemas';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recent', label: 'Mais recentes' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
  { value: 'mileage_asc', label: 'Menor km' },
];

function VehiclesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  
  // Capture UTM params
  useUTM();

  // Extract filters from URL params
  const filters: VehicleFilters = useMemo(() => ({
    brand: searchParams.get('brand') || undefined,
    model: searchParams.get('model') || undefined,
    yearMin: searchParams.get('yearMin') ? parseInt(searchParams.get('yearMin')!) : undefined,
    yearMax: searchParams.get('yearMax') ? parseInt(searchParams.get('yearMax')!) : undefined,
    priceMin: searchParams.get('priceMin') ? parseInt(searchParams.get('priceMin')!) : undefined,
    priceMax: searchParams.get('priceMax') ? parseInt(searchParams.get('priceMax')!) : undefined,
    mileageMin: searchParams.get('mileageMin') ? parseInt(searchParams.get('mileageMin')!) : undefined,
    mileageMax: searchParams.get('mileageMax') ? parseInt(searchParams.get('mileageMax')!) : undefined,
    transmission: searchParams.get('transmission') || undefined,
    fuel: searchParams.get('fuel') || undefined,
    state: searchParams.get('state') || undefined,
  }), [searchParams]);

  const { data: vehicles, isLoading } = useVehicles(filters, sortBy);

  const breadcrumbItems = useMemo(() => {
    const items: { label: string; href?: string }[] = [
      { label: 'Veículos', href: '/veiculos' }
    ];
    
    if (filters.brand) {
      items.push({ 
        label: filters.brand, 
        href: `/veiculos?brand=${filters.brand}` 
      });
    }
    
    if (filters.state) {
      const stateName = STATES.find(s => s.uf === filters.state)?.name || filters.state;
      items.push({ 
        label: stateName
      });
    }
    
    if (items.length > 0) {
      items[items.length - 1] = { label: items[items.length - 1].label };
    }
    
    return items;
  }, [filters]);

  const handleFilterChange = (newFilters: VehicleFilters) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, String(value));
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="min-h-screen pt-16">
      {vehicles && vehicles.length > 0 && (
        <ItemListSchema vehicles={vehicles} listName="Veículos Disponíveis" />
      )}
      
      <Breadcrumbs items={breadcrumbItems} />
      
      <div className="container pb-6">
        <div className="mb-6">
          <h1 className="font-heading text-2xl md:text-3xl font-bold mb-2">
            Veículos disponíveis
          </h1>
          <p className="text-muted-foreground">
            {isLoading ? 'Carregando...' : `${vehicles?.length || 0} veículo${(vehicles?.length || 0) !== 1 ? 's' : ''} encontrado${(vehicles?.length || 0) !== 1 ? 's' : ''}`}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="hidden lg:block lg:w-72 shrink-0">
            <SidebarFilters 
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </aside>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="lg:hidden flex-1">
                <MobileFiltersSheet 
                  filters={filters}
                  onFilterChange={handleFilterChange}
                />
              </div>

              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-auto min-w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden bg-card">
                    <Skeleton className="aspect-[4/3] w-full" />
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-6 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : vehicles && vehicles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {vehicles.map((vehicle, i) => (
                  <motion.div
                    key={vehicle.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * i }}
                  >
                    {/* @ts-ignore */}
                    <VehicleCard vehicle={vehicle} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-kairos-soft flex items-center justify-center">
                  <ChevronDown className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">
                  Nenhum veículo encontrado
                </h3>
                <p className="text-muted-foreground mb-4">
                  Tente ajustar os filtros para encontrar mais opções
                </p>
                <Button variant="outline" onClick={() => router.push('/veiculos')}>
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function VehiclesClient() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-16 container"><Skeleton className="h-10 w-[200px]" /></div>}>
      <VehiclesContent />
    </Suspense>
  );
}
