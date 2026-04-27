import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

/** Público: pixels + client ID do Google (para botão de login). */
export interface PublicSiteSettings {
  gtm_id: string | null;
  ga_id: string | null;
  meta_pixel_id: string | null;
  social_instagram_url?: string | null;
  social_facebook_url?: string | null;
  social_linkedin_url?: string | null;
  social_youtube_url?: string | null;
  social_whatsapp_url?: string | null;
  google_oauth_client_id: string | null;
  /** Segundos entre cada veículo em destaque no banner da home (3–120). */
  hero_featured_interval_seconds?: number;
  /** Juros médios ao mês (%) para simulação de financiamento. */
  avg_financing_interest_rate?: number;
}

export interface AdminSiteSettings extends PublicSiteSettings {
  id: string;
  google_oauth_client_secret_set: boolean;
  updated_at: string;
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ['site-settings', 'public'],
    queryFn: () => fetchApi<PublicSiteSettings>('/site-settings/public'),
    retry: 2,
    retryDelay: (i) => Math.min(1000 * 2 ** i, 4000),
    staleTime: 60_000,
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
        social_instagram_url: string | null;
        social_facebook_url: string | null;
        social_linkedin_url: string | null;
        social_youtube_url: string | null;
        social_whatsapp_url: string | null;
        google_oauth_client_id: string | null;
        google_oauth_client_secret: string | null;
        hero_featured_interval_seconds: number;
        avg_financing_interest_rate: number;
      }>,
    ) => {
      try {
        return await fetchApi<AdminSiteSettings>('/admin/site-settings', {
          method: 'POST',
          requireAuth: true,
          body: JSON.stringify(settings),
        });
      } catch (error) {
        const message = error instanceof Error ? error.message.toLowerCase() : '';
        const shouldFallbackToPatch =
          message.includes('cannot post') ||
          message.includes('404') ||
          message.includes('405');

        if (!shouldFallbackToPatch) {
          throw error;
        }

        return await fetchApi<AdminSiteSettings>('/admin/site-settings', {
          method: 'PATCH',
          requireAuth: true,
          body: JSON.stringify(settings),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
    },
  });
}
