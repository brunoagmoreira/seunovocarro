import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';

export interface Banner {
  id: string;
  type: 'text' | 'image';
  title?: string;
  subtitle?: string;
  image_url?: string;
  link_url?: string;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export function useBanners() {
  return useQuery({
    queryKey: ['banners'],
    queryFn: async (): Promise<Banner[]> => {
      return await fetchApi<Banner[]>('/banners', { params: { active: true } });
    },
  });
}

export function useAllBanners() {
  return useQuery({
    queryKey: ['banners', 'all'],
    queryFn: async (): Promise<Banner[]> => {
      return await fetchApi<Banner[]>('/banners/all', { requireAuth: true });
    },
  });
}

export function useCreateBanner() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (banner: Omit<Banner, 'id' | 'created_at' | 'updated_at'>) => {
      return await fetchApi<Banner>('/banners', {
        method: 'POST',
        requireAuth: true,
        body: JSON.stringify(banner),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });
}

export function useUpdateBanner() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...banner }: Partial<Banner> & { id: string }) => {
      return await fetchApi<Banner>(`/banners/${id}`, {
        method: 'PATCH',
        requireAuth: true,
        body: JSON.stringify(banner),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return await fetchApi(`/banners/${id}`, {
        method: 'DELETE',
        requireAuth: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });
}
