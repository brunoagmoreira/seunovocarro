import { useState } from 'react';
import { SlidersHorizontal, X, Search } from 'lucide-react';
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { BRANDS, STATES, FUEL_TYPES, TRANSMISSION_TYPES, VehicleFilters } from '@/types/vehicle';

interface MobileFiltersSheetProps {
  filters: VehicleFilters;
  onFilterChange: (filters: VehicleFilters) => void;
}

const ALL_VALUE = '__all__';

export function MobileFiltersSheet({ filters, onFilterChange }: MobileFiltersSheetProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (key: keyof VehicleFilters, value: string | number | boolean | undefined) => {
    const finalValue = value === ALL_VALUE ? undefined : value;
    onFilterChange({ ...filters, [key]: finalValue });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasFilters = Object.values(filters).some(v => v !== undefined && v !== '');
  const activeFiltersCount = Object.values(filters).filter(v => v !== undefined && v !== '').length;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filtros
          {activeFiltersCount > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full gradient-brand text-white text-xs">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader>
          <SheetTitle className="font-heading">Filtros</SheetTitle>
        </SheetHeader>
        <div className="mt-6 overflow-y-auto max-h-[calc(85vh-100px)] space-y-5 pb-6">
          {/* Brand */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Marca</Label>
            <Select
              value={filters.brand || ALL_VALUE}
              onValueChange={(v) => handleChange('brand', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as marcas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>Todas as marcas</SelectItem>
                {BRANDS.map(brand => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Modelo</Label>
            <Input 
              placeholder="Ex: Civic, Corolla..."
              value={filters.model || ''}
              onChange={(e) => handleChange('model', e.target.value || undefined)}
            />
          </div>

          {/* State */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Estado</Label>
            <Select
              value={filters.state || ALL_VALUE}
              onValueChange={(v) => handleChange('state', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>Todos os estados</SelectItem>
                {STATES.map(state => (
                  <SelectItem key={state.uf} value={state.uf}>{state.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Preço</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input 
                type="number"
                placeholder="Mínimo"
                value={filters.priceMin || ''}
                onChange={(e) => handleChange('priceMin', e.target.value ? parseInt(e.target.value) : undefined)}
              />
              <Input 
                type="number"
                placeholder="Máximo"
                value={filters.priceMax || ''}
                onChange={(e) => handleChange('priceMax', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
          </div>

          {/* Year Range */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Ano</Label>
            <div className="grid grid-cols-2 gap-2">
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
          </div>

          {/* Mileage Range */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Quilometragem</Label>
            <div className="grid grid-cols-2 gap-2">
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
          </div>

          {/* Transmission */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Câmbio</Label>
            <Select
              value={filters.transmission || ALL_VALUE}
              onValueChange={(v) => handleChange('transmission', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>Todos</SelectItem>
                {Object.entries(TRANSMISSION_TYPES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fuel */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Combustível</Label>
            <Select
              value={filters.fuel || ALL_VALUE}
              onValueChange={(v) => handleChange('fuel', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>Todos</SelectItem>
                {Object.entries(FUEL_TYPES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Accepts trade */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Aceita troca</Label>
            <Select
              value={
                filters.acceptsTrade === undefined
                  ? ALL_VALUE
                  : filters.acceptsTrade
                    ? 'true'
                    : 'false'
              }
              onValueChange={(v) =>
                handleChange(
                  'acceptsTrade',
                  v === ALL_VALUE ? undefined : v === 'true'
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>Todos</SelectItem>
                <SelectItem value="true">Sim</SelectItem>
                <SelectItem value="false">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            {hasFilters && (
              <Button variant="outline" onClick={clearFilters} className="flex-1">
                <X className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            )}
            <Button 
              className="flex-1 gradient-brand text-white shadow-brand hover:opacity-90"
              onClick={() => setIsOpen(false)}
            >
              <Search className="h-4 w-4 mr-2" />
              Ver resultados
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
