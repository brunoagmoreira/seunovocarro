import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { Vehicle, VehicleFilters, SortOption } from '@/types/vehicle';

// Hook para contagem eficiente de veículos
export function useVehicleCount() {
  return useQuery({
    queryKey: ['vehicles', 'count'],
    queryFn: async () => {
      const data = await fetchApi<{ count: number }>('/vehicles/count');
      return data.count || 0;
    },
    staleTime: 60000, 
  });
}

// Helper para mapear propriedades do backend (media) para Frontend (images, videos)
const mapVehicleResponse = (v: any): Vehicle => {
  if (!v) return v;
  return {
    ...v,
    createdAt: v.created_at || v.createdAt || new Date().toISOString(),
    displayId: v.display_id || v.displayId,
    plateEnding: v.plate_ending || v.plateEnding,
    listing_type: (v.listing_type || v.listingType || 'sale') as 'sale' | 'rental',
    price: Number(v.price) || 0,
    mileage: Number(v.mileage) || 0,
    year: Number(v.year) || 0,
    images: Array.isArray(v.media) ? v.media.filter((m: any) => m.type === 'image') : (v.images || []),
    videos: Array.isArray(v.media) ? v.media.filter((m: any) => m.type === 'video') : (v.videos || []),
    seller: v.seller ? {
      id: v.seller.id || 'unknown',
      name: v.seller.dealer?.name || v.seller.full_name || v.seller.name || 'Vendedor',
      dealerName: v.seller.dealer?.name || undefined,
      city: v.seller.city || v.city || '',
      state: v.seller.state || v.state || '',
      avatarUrl: v.seller.avatar_url || v.seller.avatarUrl || '/placeholder.svg',
      dealerLogoUrl: v.seller.dealer?.logo_url || v.seller.dealer_logo_url || undefined,
      isDealer: Boolean(v.seller.dealer?.logo_url || v.seller.dealer_logo_url || v.seller.role === 'editor'),
      phone: v.seller.phone || v.phone || '',
      whatsapp: v.seller.whatsapp || v.whatsapp || '',
    } : {
      id: v.user_id || 'unknown',
      name: 'Vendedor',
      city: v.city || '',
      state: v.state || '',
      avatarUrl: '/placeholder.svg',
      dealerLogoUrl: undefined,
      isDealer: false,
      phone: v.phone || '',
      whatsapp: v.whatsapp || '',
    }
  };
};

export function useVehicles(filters?: VehicleFilters, sortBy: SortOption = 'recent') {
  return useQuery({
    queryKey: ['vehicles', filters, sortBy],
    staleTime: 30000, 
    gcTime: 60000,    
    queryFn: async () => {
      // Map filters and sortBy to API query params
      const params: Record<string, any> = {
        sort: sortBy,
        ...filters,
      };

      // O NestJS backend deverá receber esses query params e retornar os arrays mapeados de veículos
      const data = await fetchApi<any[]>('/vehicles', { params });
      return data.map(mapVehicleResponse);
    },
  });
}

export function useFeaturedVehicles() {
  return useQuery({
    queryKey: ['vehicles', 'featured'],
    staleTime: 60000,        
    gcTime: 120000,          
    refetchInterval: 120000, 
    queryFn: async () => {
      // O endpoint /vehicles/featured resolve randomização e limite para n=4 internamente
      const data = await fetchApi<any[]>('/vehicles/featured');
      return data.map(mapVehicleResponse);
    },
  });
}

export function useVehicleBySlug(slug: string | undefined, allowAnyStatus = false) {
  return useQuery({
    queryKey: ['vehicle', slug, allowAnyStatus],
    queryFn: async () => {
      if (!slug) return null;
      try {
        const params = { anyStatus: allowAnyStatus };
        const data = await fetchApi<any>(`/vehicles/${slug}`, { params });
        return mapVehicleResponse(data);
      } catch (error: any) {
        if (error.message.includes('404')) return null;
        throw error;
      }
    },
    enabled: !!slug,
  });
}

export function useSellerVehicles(sellerId?: string, excludeVehicleId?: string) {
  return useQuery({
    queryKey: ['vehicles', 'seller', sellerId, excludeVehicleId],
    queryFn: async () => {
      if (!sellerId) return [];
      const params = excludeVehicleId ? { exclude: excludeVehicleId } : undefined;
      const data = await fetchApi<any[]>(`/vehicles/seller/${sellerId}`, { params });
      return data.map(mapVehicleResponse);
    },
    enabled: !!sellerId,
  });
}
