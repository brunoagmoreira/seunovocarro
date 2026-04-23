import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

/** Público: pixels + client ID do Google (para botão de login). */
export interface PublicSiteSettings {
  gtm_id: string | null;
  ga_id: string | null;
  meta_pixel_id: string | null;
  google_oauth_client_id: string | null;
}

export interface AdminSiteSettings extends PublicSiteSettings {
  id: string;
  google_oauth_client_secret_set: boolean;
  updated_at: string;
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ['site-settings', 'public'],
    queryFn: async (): Promise<PublicSiteSettings | null> => {
      try {
        return await fetchApi<PublicSiteSettings>('/site-settings/public');
      } catch {
        return null;
      }
    },
  });
}

export function useAdminSiteSettings() {
  const { token, isAdmin } = useAuth();

  return useQuery({
    queryKey: ['site-settings', 'admin'],
    queryFn: () =>
      fetchApi<AdminSiteSettings>('/admin/site-settings', { requireAuth: true }),
    enabled: Boolean(token && isAdmin),
  });
}

export function useUpdateSiteSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      settings: Partial<{
        gtm_id: string | null;
        ga_id: string | null;
        meta_pixel_id: string | null;
        google_oauth_client_id: string | null;
        google_oauth_client_secret: string | null;
      }>,
    ) => {
      return await fetchApi<AdminSiteSettings>('/admin/site-settings', {
        method: 'PATCH',
        requireAuth: true,
        body: JSON.stringify(settings),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
    },
  });
}
