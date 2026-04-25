import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';

export interface Dealer {
  id: string;
  user_id: string; // referency to original user
  name: string;
  slug: string;
  cnpj: string;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  logo_url: string | null;
  banner_url: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  working_hours: Record<string, any> | null;
  verified: boolean;
  featured: boolean;
  since: string | null;
  whatsapp: string | null;
  phone: string | null;
  // Legacy field aliases used by migrated UI components
  dealer_slug?: string;
  dealer_name?: string;
  dealer_logo?: string | null;
  dealer_banner?: string | null;
  dealer_verified?: boolean;
  dealer_since?: string | null;
  dealer_description?: string | null;
  dealer_instagram?: string | null;
  dealer_facebook?: string | null;
  dealer_website?: string | null;
  dealer_address?: string | null;
  dealer_working_hours?: Record<string, any> | null;
  dealer_cnpj?: string | null;
  vehicle_count?: number;
}

export function useDealers(city?: string, state?: string) {
  return useQuery({
    queryKey: ['dealers', city, state],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (city) params.city = city;
      if (state) params.state = state;
      
      return await fetchApi<Dealer[]>('/dealers', { params });
    },
  });
}

export function useFeaturedDealers() {
  return useQuery({
    queryKey: ['dealers', 'featured'],
    queryFn: async () => {
      try {
        const featured = await fetchApi<Dealer[]>('/dealers/featured');
        if (Array.isArray(featured) && featured.length > 0) {
          return featured;
        }
        // Fallback útil para ambientes onde /featured está vazio ou desatualizado.
        return await fetchApi<Dealer[]>('/dealers');
      } catch {
        // Fallback para compatibilidade com APIs antigas (rota /featured ausente).
        return await fetchApi<Dealer[]>('/dealers');
      }
    },
  });
}

export function useDealer(slug: string | undefined) {
  return useQuery({
    queryKey: ['dealer', slug],
    queryFn: async () => {
      if (!slug) return null;
      try {
        return await fetchApi<Dealer>(`/dealers/${slug}`);
      } catch (err: any) {
        if (err.message.includes('404')) return null;
        throw err;
      }
    },
    enabled: !!slug,
  });
}

export const useDealerVehicles = (slug: string) => ({ data: [], isLoading: false });
export const generateDealerSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
