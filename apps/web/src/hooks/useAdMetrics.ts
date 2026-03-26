import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';

export interface AdCampaign {
  id: string;
  vehicle_id: string;
  seller_id: string;
  status: string;
  start_date: string;
  end_date: string;
  days_total: number;
  total_budget: number;
  daily_budget: number;
  amount_paid: number;
  payment_status: string;
  payment_date: string | null;
  meta_campaign_id: string | null;
  meta_adset_id: string | null;
  meta_ad_id: string | null;
  created_at: string;
  updated_at: string;
  notes: string | null;
}

export interface AdMetrics {
  id: string;
  campaign_id: string;
  vehicle_id: string;
  date: string;
  impressions: number;
  reach: number;
  clicks: number;
  link_clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  spend: number;
  leads: number;
  whatsapp_clicks: number;
  phone_calls: number;
  cost_per_lead: number;
}

export interface AdTotals {
  id: string;
  campaign_id: string;
  vehicle_id: string;
  total_impressions: number;
  total_reach: number;
  total_clicks: number;
  total_link_clicks: number;
  total_spend: number;
  total_leads: number;
  avg_ctr: number;
  avg_cpc: number;
  avg_cpm: number;
  avg_cost_per_lead: number;
  days_active: number;
}

export function useVehicleAdCampaign(vehicleId?: string) {
  return useQuery({
    queryKey: ['vehicle-ad-campaign', vehicleId],
    queryFn: async () => {
      if (!vehicleId) return null;
      try {
        return await fetchApi<AdCampaign & { totals: AdTotals[] }>(`/ads/campaign/vehicle/${vehicleId}`, { requireAuth: true });
      } catch (e: any) {
        if (e.message.includes('404')) return null;
        throw e;
      }
    },
    enabled: !!vehicleId
  });
}

export function useVehicleAdMetrics(campaignId?: string) {
  return useQuery({
    queryKey: ['vehicle-ad-metrics', campaignId],
    queryFn: async () => {
      if (!campaignId) return [];
      return await fetchApi<AdMetrics[]>(`/ads/campaign/${campaignId}/metrics`, { requireAuth: true });
    },
    enabled: !!campaignId
  });
}

export function useAllVehicleAdCampaigns(sellerId?: string) {
  return useQuery({
    queryKey: ['all-vehicle-ad-campaigns', sellerId],
    queryFn: async () => {
      if (!sellerId) return [];
      return await fetchApi<any[]>(`/ads/campaigns?seller_id=${sellerId}`, { requireAuth: true });
    },
    enabled: !!sellerId
  });
}

// Admin hooks
export function useAdminAdCampaigns(status?: string) {
  return useQuery({
    queryKey: ['admin-ad-campaigns', status],
    queryFn: async () => {
      const params = status && status !== 'all' ? { status } : undefined;
      return await fetchApi<any[]>('/admin/ads/campaigns', { requireAuth: true, params });
    }
  });
}

export function useCreateAdCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (campaign: Partial<AdCampaign>) => {
      return await fetchApi<AdCampaign>('/ads/campaigns', {
        method: 'POST',
        requireAuth: true,
        body: JSON.stringify(campaign)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ad-campaigns'] });
    }
  });
}

export function useUpdateAdCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AdCampaign> & { id: string }) => {
      return await fetchApi<AdCampaign>(`/ads/campaigns/${id}`, {
        method: 'PATCH',
        requireAuth: true,
        body: JSON.stringify(updates)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ad-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-ad-campaign'] });
    }
  });
}

export function useUpsertAdMetrics() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (metrics: Partial<AdMetrics>) => {
      return await fetchApi<AdMetrics>('/ads/metrics/upsert', {
        method: 'POST',
        requireAuth: true,
        body: JSON.stringify(metrics)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-ad-metrics'] });
    }
  });
}

export function useUpdateAdTotals() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (totals: Partial<AdTotals> & { campaign_id: string }) => {
      return await fetchApi<AdTotals>('/ads/totals/upsert', {
        method: 'POST',
        requireAuth: true,
        body: JSON.stringify(totals)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-ad-campaign'] });
    }
  });
}
