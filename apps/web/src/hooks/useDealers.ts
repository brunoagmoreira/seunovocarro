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
      return await fetchApi<Dealer[]>('/dealers/featured');
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
