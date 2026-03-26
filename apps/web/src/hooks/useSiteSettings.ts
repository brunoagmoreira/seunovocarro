import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';

export interface SiteSettings {
  id: string;
  gtm_id: string | null;
  ga_id: string | null;
  meta_pixel_id: string | null;
  updated_at: string;
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async (): Promise<SiteSettings | null> => {
      try {
        return await fetchApi<SiteSettings>('/admin/site-settings');
      } catch {
        return null;
      }
    },
  });
}

export function useUpdateSiteSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<Omit<SiteSettings, 'id' | 'updated_at'>>) => {
      return await fetchApi<SiteSettings>('/admin/site-settings', {
        method: 'POST',
        requireAuth: true,
        body: JSON.stringify(settings),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
    },
  });
}
