import Link from 'next/link';
import { POPULAR_BRANDS, POPULAR_CITIES } from '@/data/brandContent';

interface InternalLinksProps {
  type: 'brands' | 'cities' | 'all';
  currentBrand?: string;
  currentCity?: string;
  hasVehicles?: boolean;
}

export function InternalLinks({ type, currentBrand, currentCity, hasVehicles = true }: InternalLinksProps) {
  // Don't render if there are no vehicles - bad UX
  if (!hasVehicles) {
    return null;
  }

  const filteredBrands = POPULAR_BRANDS.filter(
    brand => brand.toLowerCase() !== currentBrand?.toLowerCase()
  );
  
  const filteredCities = POPULAR_CITIES.filter(
    loc => loc.city !== currentCity
  );

  return (
    <section className="py-8 border-t border-border">
      <div className="container mx-auto px-4">
        {(type === 'brands' || type === 'all') && (
          <div className="mb-8">
            <h3 className="font-heading font-bold text-lg mb-4">
              Carros por Marca
            </h3>
            <div className="flex flex-wrap gap-2">
              {filteredBrands.map((brand) => (
                <Link
                  key={brand}
                  href={`/carros/${brand.toLowerCase()}`}
                  className="px-4 py-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors text-sm"
                >
                  {brand}
                </Link>
              ))}
              <Link
                href="/veiculos"
                className="px-4 py-2 rounded-full bg-primary/10 hover:bg-primary hover:text-primary-foreground transition-colors text-sm text-primary font-medium"
              >
                Ver Todos
              </Link>
            </div>
          </div>
        )}

        {(type === 'cities' || type === 'all') && (
          <div>
            <h3 className="font-heading font-bold text-lg mb-4">
              Carros por Cidade
            </h3>
            <div className="flex flex-wrap gap-2">
              {filteredCities.map((loc) => (
                <Link
                  key={loc.city}
                  href={`/carros/${loc.state.toLowerCase()}/${loc.city}`}
                  className="px-4 py-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors text-sm"
                >
                  {loc.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}