import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';

export interface AdPlanFeatures {
  criativos?: number;
  relatorio?: string;
  alcance_estimado?: string;
  inclui?: string[];
  remarketing?: boolean;
  gerente_dedicado?: boolean;
  carrossel?: boolean;
  troca_veiculos?: boolean;
}

export interface AdPlan {
  id: string;
  name: string;
  slug: string;
  plan_type: 'individual' | 'carousel';
  min_vehicles: number;
  max_vehicles: number;
  price: number;
  daily_budget: number;
  duration_days: number;
  has_individual_metrics: boolean;
  features: AdPlanFeatures;
  badge_text: string | null;
  badge_color: string | null;
  display_order: number;
  active: boolean;
  created_at: string;
}

const DEFAULT_PLANS: AdPlan[] = [
  {
    id: '1',
    name: 'Impulso',
    slug: 'impulso',
    plan_type: 'individual',
    min_vehicles: 1,
    max_vehicles: 1,
    price: 97,
    daily_budget: 5,
    duration_days: 15,
    has_individual_metrics: true,
    features: {
      criativos: 1,
      relatorio: 'completo',
      alcance_estimado: '~4.000 visualizações',
      inclui: ['Instagram Feed', 'Facebook Feed']
    },
    badge_text: null,
    badge_color: null,
    display_order: 1,
    active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Turbo',
    slug: 'turbo',
    plan_type: 'individual',
    min_vehicles: 1,
    max_vehicles: 2,
    price: 147,
    daily_budget: 10,
    duration_days: 15,
    has_individual_metrics: true,
    features: {
      criativos: 3,
      relatorio: 'completo',
      alcance_estimado: '~6.000 visualizações',
      inclui: ['Instagram Feed', 'Facebook Feed', 'Stories'],
      remarketing: true
    },
    badge_text: 'Mais Popular',
    badge_color: 'primary',
    display_order: 2,
    active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Loja Básica',
    slug: 'loja-basica',
    plan_type: 'carousel',
    min_vehicles: 1,
    max_vehicles: 3,
    price: 497,
    daily_budget: 10,
    duration_days: 30,
    has_individual_metrics: false,
    features: {
      criativos: 1,
      relatorio: 'completo',
      alcance_estimado: '~21.000 visualizações',
      carrossel: true,
      troca_veiculos: true
    },
    badge_text: 'Para Lojistas',
    badge_color: 'green',
    display_order: 3,
    active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Loja Pro',
    slug: 'loja-pro',
    plan_type: 'carousel',
    min_vehicles: 1,
    max_vehicles: 5,
    price: 697,
    daily_budget: 15,
    duration_days: 30,
    has_individual_metrics: false,
    features: {
      criativos: 3,
      relatorio: 'completo',
      alcance_estimado: '~29.000 visualizações',
      carrossel: true,
      troca_veiculos: true
    },
    badge_text: 'Melhor Custo-Benefício',
    badge_color: 'amber',
    display_order: 4,
    active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Loja Premium',
    slug: 'loja-premium',
    plan_type: 'carousel',
    min_vehicles: 1,
    max_vehicles: 10,
    price: 997,
    daily_budget: 20,
    duration_days: 30,
    has_individual_metrics: false,
    features: {
      criativos: 5,
      relatorio: 'completo',
      alcance_estimado: '~42.000 visualizações',
      carrossel: true,
      troca_veiculos: true,
      gerente_dedicado: true
    },
    badge_text: null,
    badge_color: null,
    display_order: 5,
    active: true,
    created_at: new Date().toISOString()
  }
];

export function useAdPlans(planType?: 'individual' | 'carousel') {
  return useQuery({
    queryKey: ['ad-plans', planType],
    queryFn: async () => {
      try {
        const params = planType ? { plan_type: planType } : undefined;
        const data = await fetchApi<AdPlan[]>('/ads/plans', { params });
        
        if (!data || data.length === 0) {
          return planType ? DEFAULT_PLANS.filter(p => p.plan_type === planType) : DEFAULT_PLANS;
        }
        return data;
      } catch (error) {
        console.error('Error fetching ad plans:', error);
        return planType ? DEFAULT_PLANS.filter(p => p.plan_type === planType) : DEFAULT_PLANS;
      }
    },
    staleTime: 5 * 60 * 1000, 
    retry: 1 
  });
}

export function useAdPlanBySlug(slug?: string) {
  return useQuery({
    queryKey: ['ad-plan', slug],
    queryFn: async () => {
      if (!slug) return null;
      try {
        const data = await fetchApi<AdPlan>(`/ads/plans/${slug}`);
        return data;
      } catch (error) {
        console.error('Error fetching ad plan:', error);
        return DEFAULT_PLANS.find(p => p.slug === slug) || null;
      }
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    retry: 1
  });
}

export function useCreateBoostCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      plan_id: string;
      vehicle_ids: string[];
      campaign_type: 'individual' | 'carousel';
      total_budget: number;
      daily_budget: number;
      duration_days: number;
    }) => {
      return await fetchApi<any>('/ads/campaigns/boost', {
        method: 'POST',
        requireAuth: true,
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-ad-campaign'] });
      queryClient.invalidateQueries({ queryKey: ['all-vehicle-ad-campaigns'] });
    }
  });
}
