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
      const data = await fetchApi<Vehicle[]>('/vehicles', { params });
      return data;
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
      const data = await fetchApi<Vehicle[]>('/vehicles/featured');
      return data;
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
        const data = await fetchApi<Vehicle>(`/vehicles/${slug}`, { params });
        return data;
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
      const data = await fetchApi<Vehicle[]>(`/vehicles/seller/${sellerId}`, { params });
      return data;
    },
    enabled: !!sellerId,
  });
}
