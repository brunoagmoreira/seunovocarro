import { useState } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { BRANDS, STATES, FUEL_TYPES, TRANSMISSION_TYPES, VehicleFilters } from '@/types/vehicle';

interface SearchFiltersProps {
  filters: VehicleFilters;
  onFilterChange: (filters: VehicleFilters) => void;
  onSearch: () => void;
  variant?: 'hero' | 'compact';
}

const ALL_VALUE = '__all__';

export function SearchFilters({ 
  filters, 
  onFilterChange, 
  onSearch,
  variant = 'compact' 
}: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (key: keyof VehicleFilters, value: string | number | undefined) => {
    const finalValue = value === ALL_VALUE ? undefined : value;
    onFilterChange({ ...filters, [key]: finalValue });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasFilters = Object.values(filters).some(v => v !== undefined && v !== '');

  const FilterContent = () => (
    <div className="flex flex-col gap-5">
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

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-border">
        {hasFilters && (
          <Button variant="outline" onClick={clearFilters} className="flex-1">
            <X className="h-4 w-4 mr-2" />
            Limpar
          </Button>
        )}
        <Button 
          className="flex-1 gradient-kairos text-white shadow-kairos hover:opacity-90"
          onClick={() => {
            onSearch();
            setIsOpen(false);
          }}
        >
          <Search className="h-4 w-4 mr-2" />
          Buscar
        </Button>
      </div>
    </div>
  );

  // Hero variant for home page - OLX inspired
  if (variant === 'hero') {
    return (
      <div className="bg-card rounded-2xl p-4 md:p-6 shadow-elevated">
        {/* Initial Filters - Always visible */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Select
            value={filters.brand || ALL_VALUE}
            onValueChange={(v) => handleChange('brand', v)}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Todas as marcas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Todas as marcas</SelectItem>
              {BRANDS.map(brand => (
                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input 
            placeholder="Modelo"
            value={filters.model || ''}
            onChange={(e) => handleChange('model', e.target.value || undefined)}
            className="h-12"
          />

          <Select
            value={filters.state || ALL_VALUE}
            onValueChange={(v) => handleChange('state', v)}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Todos os estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Todos os estados</SelectItem>
              {STATES.map(state => (
                <SelectItem key={state.uf} value={state.uf}>{state.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button className="gradient-kairos text-white shadow-kairos hover:opacity-90 h-12" onClick={onSearch} size="lg">
            <Search className="h-5 w-5 mr-2" />
            Buscar
          </Button>
        </div>

        {/* Advanced Filters Toggle */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <div className="border-t border-border pt-4">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                {showAdvanced ? 'Menos filtros' : 'Mais filtros'}
                {showAdvanced ? (
                  <ChevronUp className="h-4 w-4 ml-1" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-1" />
                )}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-4">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                {/* Price Range */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Preço mín.</Label>
                  <Input 
                    type="number"
                    placeholder="R$ 0"
                    value={filters.priceMin || ''}
                    onChange={(e) => handleChange('priceMin', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Preço máx.</Label>
                  <Input 
                    type="number"
                    placeholder="R$ 500.000"
                    value={filters.priceMax || ''}
                    onChange={(e) => handleChange('priceMax', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>

                {/* Transmission */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Câmbio</Label>
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
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Combustível</Label>
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

                {/* Year Range */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Ano de</Label>
                  <Input 
                    type="number"
                    placeholder="2010"
                    value={filters.yearMin || ''}
                    onChange={(e) => handleChange('yearMin', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Ano até</Label>
                  <Input 
                    type="number"
                    placeholder="2025"
                    value={filters.yearMax || ''}
                    onChange={(e) => handleChange('yearMax', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
              </div>

              {/* Second row - Mileage */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Km mín.</Label>
                  <Input 
                    type="number"
                    placeholder="0 km"
                    value={filters.mileageMin || ''}
                    onChange={(e) => handleChange('mileageMin', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Km máx.</Label>
                  <Input 
                    type="number"
                    placeholder="200.000 km"
                    value={filters.mileageMax || ''}
                    onChange={(e) => handleChange('mileageMax', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
              </div>
            </CollapsibleContent>

            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-3 text-destructive hover:text-destructive">
                <X className="h-4 w-4 mr-1" />
                Limpar filtros
              </Button>
            )}
          </div>
        </Collapsible>
      </div>
    );
  }

  // Compact variant with mobile sheet - Sidebar style like OLX
  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <div className="bg-card rounded-xl p-6 shadow-card sticky top-20">
          <h3 className="font-heading font-bold text-lg mb-4">Filtros</h3>
          <FilterContent />
        </div>
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filtros
              {hasFilters && (
                <span className="ml-2 px-2 py-0.5 rounded-full gradient-kairos text-white text-xs">
                  {Object.values(filters).filter(v => v !== undefined && v !== '').length}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
            <SheetHeader>
              <SheetTitle className="font-heading">Filtros</SheetTitle>
            </SheetHeader>
            <div className="mt-6 overflow-y-auto max-h-[calc(85vh-100px)]">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
