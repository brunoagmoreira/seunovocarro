export interface Vehicle {
  id: string;
  displayId?: string;
  brand: string;
  model: string;
  version: string;
  year: number;
  mileage: number;
  transmission: 'manual' | 'automatic';
  fuel: 'gasoline' | 'ethanol' | 'flex' | 'diesel' | 'electric' | 'hybrid';
  color: string;
  doors: number;
  plateEnding: string;
  price: number;
  description: string;
  city: string;
  state: string;
  whatsapp: string;
  phone: string;
  listing_type?: 'sale' | 'rental';
  accepts_trade?: boolean;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  slug: string;
  createdAt: string;
  updatedAt: string;
  seller: Seller;
  images: VehicleMedia[];
  videos: VehicleMedia[];
}

export interface VehicleMedia {
  id: string;
  url: string;
  type: 'image' | 'video';
  order: number;
}

export interface Seller {
  id: string;
  name: string;
  dealerName?: string;
  avatarUrl: string;
  dealerLogoUrl?: string;
  isDealer?: boolean;
  city: string;
  state: string;
  whatsapp: string;
  phone: string;
}

export interface VehicleFilters {
  brand?: string;
  model?: string;
  listingType?: 'sale' | 'rental';
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMin?: number;
  mileageMax?: number;
  transmission?: string;
  fuel?: string;
  city?: string;
  state?: string;
  acceptsTrade?: boolean;
}

export type SortOption = 'recent' | 'price_asc' | 'price_desc' | 'mileage_asc';

export const BRANDS = [
  'Audi', 'BMW', 'Chevrolet', 'Citroën', 'Fiat', 'Ford', 'Honda', 'Hyundai', 
  'Jeep', 'Kia', 'Mercedes-Benz', 'Mitsubishi', 'Nissan', 'Peugeot', 'Renault', 
  'Toyota', 'Volkswagen', 'Volvo'
];

export const FUEL_TYPES = {
  gasoline: 'Gasolina',
  ethanol: 'Álcool',
  flex: 'Flex',
  diesel: 'Diesel',
  electric: 'Elétrico',
  hybrid: 'Híbrido'
};

export const TRANSMISSION_TYPES = {
  manual: 'Manual',
  automatic: 'Automático'
};

export const STATES = [
  { uf: 'AC', name: 'Acre' },
  { uf: 'AL', name: 'Alagoas' },
  { uf: 'AP', name: 'Amapá' },
  { uf: 'AM', name: 'Amazonas' },
  { uf: 'BA', name: 'Bahia' },
  { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' },
  { uf: 'ES', name: 'Espírito Santo' },
  { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' },
  { uf: 'MT', name: 'Mato Grosso' },
  { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MG', name: 'Minas Gerais' },
  { uf: 'PA', name: 'Pará' },
  { uf: 'PB', name: 'Paraíba' },
  { uf: 'PR', name: 'Paraná' },
  { uf: 'PE', name: 'Pernambuco' },
  { uf: 'PI', name: 'Piauí' },
  { uf: 'RJ', name: 'Rio de Janeiro' },
  { uf: 'RN', name: 'Rio Grande do Norte' },
  { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'RO', name: 'Rondônia' },
  { uf: 'RR', name: 'Roraima' },
  { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'São Paulo' },
  { uf: 'SE', name: 'Sergipe' },
  { uf: 'TO', name: 'Tocantins' }
];
