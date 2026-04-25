import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { POPULAR_BRANDS, POPULAR_CITIES } from '@/data/brandContent';
import { useAvailableBrandsAndCities } from '@/hooks/useAvailableBrandsAndCities';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { data: available } = useAvailableBrandsAndCities();

  // Filter brands and cities to only show those with vehicles
  const brandsWithVehicles = POPULAR_BRANDS.filter(brand => 
    available?.brands.includes(brand.toLowerCase())
  );

  const citiesWithVehicles = POPULAR_CITIES.filter(loc => {
    const citySlug = loc.city.toLowerCase();
    const stateSlug = loc.state.toLowerCase();
    return available?.cities.some(c => c.startsWith(`${stateSlug}/`) && c.includes(citySlug));
  });

  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Logo className="h-8 mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              A melhor plataforma para comprar e vender carros usados e seminovos no Brasil.
            </p>
            <p className="text-xs text-muted-foreground">
              © {currentYear} Seu Novo Carro. Todos os direitos reservados.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-heading font-bold mb-4">Links Úteis</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/veiculos" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Ver Veículos
                </Link>
              </li>
              <li>
                <Link href="/lojas" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Lojas Parceiras
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/anunciar" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Anunciar Meu Carro
                </Link>
              </li>
              <li>
                <Link href="/impulsionar" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Impulsionar Anúncio
                </Link>
              </li>
              <li>
                <Link href="/como-funciona" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link href="/perguntas-frequentes" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Perguntas Frequentes
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Sobre a Seu Novo Carro
                </Link>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/_seunovocarro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Entrar / Cadastrar
                </Link>
              </li>
            </ul>
          </div>

          {/* Brands - only show if there are vehicles */}
          {brandsWithVehicles.length > 0 && (
            <div>
              <h3 className="font-heading font-bold mb-4">Carros por Marca</h3>
              <ul className="space-y-2">
                {brandsWithVehicles.slice(0, 8).map((brand) => (
                  <li key={brand}>
                    <Link 
                      href={`/carros/${brand.toLowerCase()}`}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {brand} Usados
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cities - only show if there are vehicles */}
          {citiesWithVehicles.length > 0 && (
            <div>
              <h3 className="font-heading font-bold mb-4">Carros por Cidade</h3>
              <ul className="space-y-2">
                {citiesWithVehicles.slice(0, 8).map((loc) => (
                  <li key={loc.city}>
                    <Link 
                      href={`/carros/${loc.state.toLowerCase()}/${loc.city}`}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      Carros em {loc.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Bottom SEO Links - only show if there are vehicles */}
        {(brandsWithVehicles.length > 0 || citiesWithVehicles.length > 0) && (
          <div className="mt-12 pt-8 border-t border-border">
            {brandsWithVehicles.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span>Marcas:</span>
                {brandsWithVehicles.map((brand, index) => (
                  <span key={brand}>
                    <Link 
                      href={`/carros/${brand.toLowerCase()}`}
                      className="hover:text-primary transition-colors"
                    >
                      {brand}
                    </Link>
                    {index < brandsWithVehicles.length - 1 && ' • '}
                  </span>
                ))}
              </div>
            )}
            {citiesWithVehicles.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground mt-2">
                <span>Cidades:</span>
                {citiesWithVehicles.map((loc, index) => (
                  <span key={loc.city}>
                    <Link 
                      href={`/carros/${loc.state.toLowerCase()}/${loc.city}`}
                      className="hover:text-primary transition-colors"
                    >
                      {loc.name}
                    </Link>
                    {index < citiesWithVehicles.length - 1 && ' • '}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </footer>
  );
}
