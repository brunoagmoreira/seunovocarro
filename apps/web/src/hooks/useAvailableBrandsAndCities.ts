import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';

export function useAvailableBrandsAndCities() {
  return useQuery({
    queryKey: ['available-brands-cities'],
    staleTime: 1000 * 60 * 5, 
    gcTime: 1000 * 60 * 10,   
    queryFn: async () => {
      return await fetchApi<{ brands: string[], cities: string[] }>('/vehicles/available-brands-cities');
    },
  });
}
