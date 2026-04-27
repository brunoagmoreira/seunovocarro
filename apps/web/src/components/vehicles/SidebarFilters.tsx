import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { BRANDS, STATES, FUEL_TYPES, TRANSMISSION_TYPES, VehicleFilters } from '@/types/vehicle';

interface SidebarFiltersProps {
  filters: VehicleFilters;
  onFilterChange: (filters: VehicleFilters) => void;
}

const ALL_VALUE = '__all__';

const PRICE_RANGES = [
  { label: 'Até R$ 30.000', min: 0, max: 30000 },
  { label: 'R$ 30.000 - R$ 50.000', min: 30000, max: 50000 },
  { label: 'R$ 50.000 - R$ 80.000', min: 50000, max: 80000 },
  { label: 'R$ 80.000 - R$ 120.000', min: 80000, max: 120000 },
  { label: 'R$ 120.000 - R$ 200.000', min: 120000, max: 200000 },
  { label: 'Acima de R$ 200.000', min: 200000, max: undefined },
];

const KM_RANGES = [
  { label: 'Até 10.000 km', min: 0, max: 10000 },
  { label: '10.000 - 30.000 km', min: 10000, max: 30000 },
  { label: '30.000 - 60.000 km', min: 30000, max: 60000 },
  { label: '60.000 - 100.000 km', min: 60000, max: 100000 },
  { label: 'Acima de 100.000 km', min: 100000, max: undefined },
];

const currentYear = new Date().getFullYear();
const YEAR_RANGES = [
  { label: 'Até 2015', min: undefined, max: 2015 },
  { label: '2016 - 2018', min: 2016, max: 2018 },
  { label: '2019 - 2021', min: 2019, max: 2021 },
  { label: '2022 - 2024', min: 2022, max: 2024 },
  { label: '2025+', min: 2025, max: undefined },
];

export function SidebarFilters({ filters, onFilterChange }: SidebarFiltersProps) {
  const handleChange = (key: keyof VehicleFilters, value: string | number | boolean | undefined) => {
    const finalValue = value === ALL_VALUE ? undefined : value;
    onFilterChange({ ...filters, [key]: finalValue });
  };

  const handleRangeSelect = (
    minKey: 'priceMin' | 'mileageMin' | 'yearMin',
    maxKey: 'priceMax' | 'mileageMax' | 'yearMax',
    min: number | undefined,
    max: number | undefined
  ) => {
    onFilterChange({
      ...filters,
      [minKey]: min,
      [maxKey]: max,
    });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasFilters = Object.values(filters).some(v => v !== undefined && v !== '');

  const activeFiltersCount = Object.values(filters).filter(v => v !== undefined && v !== '').length;

  return (
    <div className="bg-card rounded-xl shadow-card sticky top-20">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-heading font-bold">Filtros</h3>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive hover:text-destructive">
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {/* Filters */}
      <Accordion type="multiple" defaultValue={['brand', 'price', 'year', 'km', 'transmission', 'fuel', 'acceptsTrade']} className="p-4">
        {/* Brand */}
        <AccordionItem value="brand" className="border-b">
          <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline">
            Marca
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <Select
              value={filters.brand || ALL_VALUE}
              onValueChange={(v) => handleChange('brand', v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todas as marcas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>Todas as marcas</SelectItem>
                {BRANDS.map(brand => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Model input */}
            <div className="mt-3">
              <Input 
                placeholder="Buscar modelo..."
                value={filters.model || ''}
                onChange={(e) => handleChange('model', e.target.value || undefined)}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price */}
        <AccordionItem value="price" className="border-b">
          <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline">
            Preço
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-2">
              {PRICE_RANGES.map((range, i) => {
                const isSelected = filters.priceMin === range.min && filters.priceMax === range.max;
                return (
                  <div key={i} className="relative group">
                    <button
                      onClick={() => handleRangeSelect('priceMin', 'priceMax', range.min, range.max)}
                      className={`
                        w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                        ${isSelected ? 'bg-primary text-primary-foreground pr-9' : 'hover:bg-muted'}
                      `}
                    >
                      {range.label}
                    </button>
                    {isSelected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRangeSelect('priceMin', 'priceMax', undefined, undefined);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-primary-foreground/20 transition-colors"
                        aria-label="Remover filtro"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Custom range */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Input 
                type="number"
                placeholder="Mín."
                value={filters.priceMin || ''}
                onChange={(e) => handleChange('priceMin', e.target.value ? parseInt(e.target.value) : undefined)}
              />
              <Input 
                type="number"
                placeholder="Máx."
                value={filters.priceMax || ''}
                onChange={(e) => handleChange('priceMax', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Year */}
        <AccordionItem value="year" className="border-b">
          <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline">
            Ano
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-2">
              {YEAR_RANGES.map((range, i) => {
                const isSelected = filters.yearMin === range.min && filters.yearMax === range.max;
                return (
                  <div key={i} className="relative group">
                    <button
                      onClick={() => handleRangeSelect('yearMin', 'yearMax', range.min, range.max)}
                      className={`
                        w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                        ${isSelected ? 'bg-primary text-primary-foreground pr-9' : 'hover:bg-muted'}
                      `}
                    >
                      {range.label}
                    </button>
                    {isSelected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRangeSelect('yearMin', 'yearMax', undefined, undefined);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-primary-foreground/20 transition-colors"
                        aria-label="Remover filtro"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Custom range */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Input 
                type="number"
                placeholder="De"
                value={filters.yearMin || ''}
                onChange={(e) => handleChange('yearMin', e.target.value ? parseInt(e.target.value) : undefined)}
              />
              <Input 
                type="number"
                placeholder="Até"
                value={filters.yearMax || ''}
                onChange={(e) => handleChange('yearMax', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Mileage */}
        <AccordionItem value="km" className="border-b">
          <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline">
            Quilometragem
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-2">
              {KM_RANGES.map((range, i) => {
                const isSelected = filters.mileageMin === range.min && filters.mileageMax === range.max;
                return (
                  <div key={i} className="relative group">
                    <button
                      onClick={() => handleRangeSelect('mileageMin', 'mileageMax', range.min, range.max)}
                      className={`
                        w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                        ${isSelected ? 'bg-primary text-primary-foreground pr-9' : 'hover:bg-muted'}
                      `}
                    >
                      {range.label}
                    </button>
                    {isSelected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRangeSelect('mileageMin', 'mileageMax', undefined, undefined);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-primary-foreground/20 transition-colors"
                        aria-label="Remover filtro"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Custom range */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Input 
                type="number"
                placeholder="Km mín."
                value={filters.mileageMin || ''}
                onChange={(e) => handleChange('mileageMin', e.target.value ? parseInt(e.target.value) : undefined)}
              />
              <Input 
                type="number"
                placeholder="Km máx."
                value={filters.mileageMax || ''}
                onChange={(e) => handleChange('mileageMax', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Transmission */}
        <AccordionItem value="transmission" className="border-b">
          <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline">
            Câmbio
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-2">
              <button
                onClick={() => handleChange('transmission', undefined)}
                className={`
                  w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                  ${!filters.transmission ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
                `}
              >
                Todos
              </button>
              {Object.entries(TRANSMISSION_TYPES).map(([key, label]) => {
                const isSelected = filters.transmission === key;
                return (
                  <div key={key} className="relative group">
                    <button
                      onClick={() => handleChange('transmission', key)}
                      className={`
                        w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                        ${isSelected ? 'bg-primary text-primary-foreground pr-9' : 'hover:bg-muted'}
                      `}
                    >
                      {label}
                    </button>
                    {isSelected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChange('transmission', undefined);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-primary-foreground/20 transition-colors"
                        aria-label="Remover filtro"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Fuel */}
        <AccordionItem value="fuel" className="border-b-0">
          <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline">
            Combustível
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-2">
              <button
                onClick={() => handleChange('fuel', undefined)}
                className={`
                  w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                  ${!filters.fuel ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
                `}
              >
                Todos
              </button>
              {Object.entries(FUEL_TYPES).map(([key, label]) => {
                const isSelected = filters.fuel === key;
                return (
                  <div key={key} className="relative group">
                    <button
                      onClick={() => handleChange('fuel', key)}
                      className={`
                        w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                        ${isSelected ? 'bg-primary text-primary-foreground pr-9' : 'hover:bg-muted'}
                      `}
                    >
                      {label}
                    </button>
                    {isSelected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChange('fuel', undefined);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-primary-foreground/20 transition-colors"
                        aria-label="Remover filtro"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Accepts trade */}
        <AccordionItem value="acceptsTrade" className="border-t">
          <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline">
            Aceita troca
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-2">
              <button
                onClick={() => handleChange('acceptsTrade', undefined)}
                className={`
                  w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                  ${filters.acceptsTrade === undefined ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
                `}
              >
                Todos
              </button>
              <button
                onClick={() => handleChange('acceptsTrade', true)}
                className={`
                  w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                  ${filters.acceptsTrade === true ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
                `}
              >
                Sim
              </button>
              <button
                onClick={() => handleChange('acceptsTrade', false)}
                className={`
                  w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                  ${filters.acceptsTrade === false ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
                `}
              >
                Não
              </button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* State */}
        <AccordionItem value="state" className="border-t">
          <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline">
            Estado
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <Select
              value={filters.state || ALL_VALUE}
              onValueChange={(v) => handleChange('state', v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos os estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>Todos os estados</SelectItem>
                {STATES.map(state => (
                  <SelectItem key={state.uf} value={state.uf}>{state.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
