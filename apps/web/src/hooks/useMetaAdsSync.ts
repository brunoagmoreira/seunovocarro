import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface SyncOptions {
  vehicle_code?: string;
  startDate?: string;
  endDate?: string;
  date_range?: {
    start: string;
    end: string;
  };
}

interface SyncResult {
  success: boolean;
  synced: number;
  campaigns: Array<{
    vehicle_code: string;
    vehicle: string;
    campaign_id: string;
    meta_campaign_id: string;
    status: string;
    metrics: {
      impressions: number;
      reach: number;
      clicks: number;
      spend: number;
      leads: number;
      days_synced: number;
    };
  }>;
  errors?: Array<{
    code: string;
    error: string;
  }>;
}

export function useMetaAdsSync() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (options: SyncOptions = {}): Promise<SyncResult> => {
      return await fetchApi<SyncResult>('/admin/ads/sync', {
        method: 'POST',
        requireAuth: true,
        body: JSON.stringify({ action: 'sync', ...options })
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-ad-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-ad-campaign'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-ad-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['all-vehicle-ad-campaigns'] });

      toast({
        title: 'Sincronização concluída!',
        description: `${data.synced} campanhas sincronizadas com sucesso.`
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro na sincronização',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}

export function useVehicleAdCode() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ vehicleId, adCode }: { vehicleId: string; adCode: string }) => {
      return await fetchApi(`/vehicles/${vehicleId}/ad-code`, {
        method: 'PATCH',
        requireAuth: true,
        body: JSON.stringify({ ad_code: adCode })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast({
        title: 'Código atualizado!',
        description: 'O código do anúncio foi salvo com sucesso.'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao salvar código',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}
