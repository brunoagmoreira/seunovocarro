import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { POPULAR_BRANDS, POPULAR_CITIES } from '@/data/brandContent';
import { STATES } from '@/types/vehicle';
import { CarrosClient } from './CarrosClient';

type Props = {
  params: Promise<{ slug: string[] }>;
};

function formatCityName(city: string): string {
  return city
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  if (!slug || slug.length === 0 || slug.length > 3) {
    return { title: 'Página não encontrada' };
  }

  let title = 'Kairós Auto';
  let description = '';
  let keywords: string[] = [];

  // 1. /carros/:brand
  if (slug.length === 1) {
    const brand = slug[0].toLowerCase();
    const brandDisplay = POPULAR_BRANDS.find(b => b.toLowerCase() === brand) || 
                         (brand.charAt(0).toUpperCase() + brand.slice(1));
                         
    title = `${brandDisplay} Usados e Seminovos | Preços e Ofertas`;
    description = `Encontre ${brandDisplay} usados e seminovos com os melhores preços. Veículos verificados, compra segura!`;
    keywords = [`${brand} usado`, `${brand} seminovo`, `comprar ${brand}`, `${brand} preço`];
  } 
  
  // 2. /carros/:state/:city
  else if (slug.length === 2) {
    const stateUrl = slug[0].toUpperCase();
    const cityUrl = slug[1].toLowerCase();
    
    const stateData = STATES.find(s => s.uf === stateUrl);
    const stateName = stateData?.name || stateUrl;
    
    const knownCity = POPULAR_CITIES.find(c => c.city === cityUrl && c.state === stateUrl);
    const cityDisplay = knownCity?.name || formatCityName(cityUrl);
    
    const locationName = `${cityDisplay}, ${stateUrl}`;
    
    title = `Carros Usados em ${locationName}`;
    description = `Encontre carros usados e seminovos em ${locationName}. Negocie direto com vendedores verificados!`;
    keywords = [`carros usados ${locationName}`, `seminovos ${locationName}`, `comprar carro ${locationName}`];
  }
  
  // 3. /carros/:brand/:state/:city
  else if (slug.length === 3) {
    const brand = slug[0].toLowerCase();
    const stateUrl = slug[1].toUpperCase();
    const cityUrl = slug[2].toLowerCase();
    
    const brandDisplay = POPULAR_BRANDS.find(b => b.toLowerCase() === brand) || 
                         (brand.charAt(0).toUpperCase() + brand.slice(1));
                         
    const knownCity = POPULAR_CITIES.find(c => c.city === cityUrl && c.state === stateUrl);
    const cityDisplay = knownCity?.name || formatCityName(cityUrl);
    
    title = `${brandDisplay} Usados em ${cityDisplay}, ${stateUrl}`;
    description = `Encontre ${brandDisplay} usados em ${cityDisplay}, ${stateUrl}. Vendedores verificados!`;
    keywords = [`${brand} usado ${cityDisplay}`, `${brand} seminovo ${cityDisplay}`];
  }

  return { title, description, keywords };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  
  if (!slug || slug.length === 0 || slug.length > 3) {
    notFound();
  }
  
  return <CarrosClient slug={slug} />;
}
