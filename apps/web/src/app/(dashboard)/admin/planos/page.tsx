"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';

interface DealerPlan {
  slug: string;
  name: string;
  price: number;
  duration_days: number;
  billing_enabled: boolean;
  billing_frequency: string;
  max_vehicles: number;
  xml_enabled: boolean;
  sdr_enabled: boolean;
  sdr_whatsapp: string;
}

interface BillingConfig {
  asaas_enabled: boolean;
  asaas_api_url: string;
  asaas_api_key: string;
  default_billing_type: string;
  default_frequency: string;
}

interface DealerItem {
  id: string;
  name: string;
  slug: string;
  owner_name: string | null;
  owner_email: string | null;
  plan_slug: string;
  billing_custom_price: number | null;
  billing_discount_percent: number | null;
  billing_discount_fixed: number | null;
  asaas_customer_id: string | null;
  last_charge?: {
    id: string;
    status: string;
    value: number;
    invoice_url?: string | null;
    created_at: string;
  } | null;
}

export default function AdminDealerPlansPage() {
  const [plans, setPlans] = useState<DealerPlan[]>([]);
  const [dealers, setDealers] = useState<DealerItem[]>([]);
  const [billingConfig, setBillingConfig] = useState<BillingConfig>({
    asaas_enabled: false,
    asaas_api_url: 'https://api-sandbox.asaas.com',
    asaas_api_key: '',
    default_billing_type: 'CREDIT_CARD',
    default_frequency: 'monthly',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchApi<{ plans: DealerPlan[]; dealers: DealerItem[]; billing_config: BillingConfig }>(
        '/admin/dealer-plans',
        { requireAuth: true },
      );
      setPlans(data.plans || []);
      setDealers(data.dealers || []);
      if (data.billing_config) setBillingConfig(data.billing_config);
    } catch (error: any) {
      toast.error('Erro ao carregar planos', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const updatePlanLocal = (slug: string, patch: Partial<DealerPlan>) => {
    setPlans((prev) => prev.map((plan) => (plan.slug === slug ? { ...plan, ...patch } : plan)));
  };

  const savePlan = async (plan: DealerPlan) => {
    try {
      await fetchApi(`/admin/dealer-plans/${plan.slug}`, {
        method: 'PATCH',
        requireAuth: true,
        body: {
          price: Number(plan.price) || 0,
          duration_days: Number(plan.duration_days) || 30,
          billing_enabled: plan.billing_enabled,
          billing_frequency: plan.billing_frequency,
          max_vehicles: Number(plan.max_vehicles) || 0,
          xml_enabled: plan.xml_enabled,
          sdr_enabled: plan.sdr_enabled,
          sdr_whatsapp: plan.sdr_whatsapp,
        },
      });
      toast.success(`${plan.name} atualizado`);
      await loadData();
    } catch (error: any) {
      toast.error('Erro ao salvar plano', { description: error.message });
    }
  };

  const saveBillingConfig = async () => {
    try {
      await fetchApi('/admin/dealer-plans/billing-config', {
        method: 'PATCH',
        requireAuth: true,
        body: billingConfig,
      });
      toast.success('Configuração Asaas salva');
    } catch (error: any) {
      toast.error('Erro ao salvar Asaas', { description: error.message });
    }
  };

  const updateDealerBillingLocal = (dealerId: string, patch: Partial<DealerItem>) => {
    setDealers((prev) => prev.map((dealer) => (dealer.id === dealerId ? { ...dealer, ...patch } : dealer)));
  };

  const saveDealerBilling = async (dealer: DealerItem) => {
    try {
      await fetchApi(`/admin/dealer-plans/dealers/${dealer.id}/billing`, {
        method: 'PATCH',
        requireAuth: true,
        body: {
          custom_price: dealer.billing_custom_price,
          discount_percent: dealer.billing_discount_percent,
          discount_fixed: dealer.billing_discount_fixed,
        },
      });
      toast.success('Condição comercial atualizada');
    } catch (error: any) {
      toast.error('Erro ao salvar desconto', { description: error.message });
      await loadData();
    }
  };

  const chargeDealerNow = async (dealer: DealerItem) => {
    try {
      const response = await fetchApi<{ invoice_url?: string }>(`/admin/dealer-plans/dealers/${dealer.id}/charge`, {
        method: 'PATCH',
        requireAuth: true,
      });
      toast.success('Cobrança criada com sucesso');
      if (response?.invoice_url) {
        window.open(response.invoice_url, '_blank');
      }
      await loadData();
    } catch (error: any) {
      toast.error('Erro ao cobrar lojista', { description: error.message });
    }
  };

  const updateDealerPlan = async (dealerId: string, planSlug: string) => {
    setDealers((prev) => prev.map((dealer) => (dealer.id === dealerId ? { ...dealer, plan_slug: planSlug } : dealer)));
    try {
      await fetchApi(`/admin/dealer-plans/dealers/${dealerId}`, {
        method: 'PATCH',
        requireAuth: true,
        body: { plan_slug: planSlug },
      });
      toast.success('Plano do lojista atualizado');
    } catch (error: any) {
      toast.error('Erro ao atualizar lojista', { description: error.message });
      await loadData();
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="container py-6 space-y-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold">Planos de Lojista</h1>
            <p className="text-sm text-muted-foreground">
              Configure Asaas, plano mensal e regras comerciais por lojista.
            </p>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-card p-5 space-y-4">
          <h2 className="font-heading font-semibold text-lg">Gateway de Pagamento (Asaas)</h2>
          <div className="flex items-center justify-between">
            <Label>Integração ativa</Label>
            <Switch
              checked={billingConfig.asaas_enabled}
              onCheckedChange={(value) => setBillingConfig((prev) => ({ ...prev, asaas_enabled: value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Base URL da API</Label>
            <Input
              value={billingConfig.asaas_api_url}
              onChange={(e) => setBillingConfig((prev) => ({ ...prev, asaas_api_url: e.target.value }))}
              placeholder="https://api-sandbox.asaas.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Token da API (access_token)</Label>
            <Input
              value={billingConfig.asaas_api_key}
              onChange={(e) => setBillingConfig((prev) => ({ ...prev, asaas_api_key: e.target.value }))}
              placeholder="$aact_xxx..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Frequência padrão</Label>
              <Select
                value={billingConfig.default_frequency}
                onValueChange={(value) => setBillingConfig((prev) => ({ ...prev, default_frequency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Método padrão</Label>
              <Select
                value={billingConfig.default_billing_type}
                onValueChange={(value) => setBillingConfig((prev) => ({ ...prev, default_billing_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CREDIT_CARD">Cartão de crédito</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={saveBillingConfig}>Salvar configuração do Asaas</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div key={plan.slug} className="bg-card rounded-2xl shadow-card p-5 space-y-4">
              <h2 className="font-heading font-semibold text-lg">{plan.name}</h2>
              <div className="space-y-2">
                <Label>Valor do plano (R$ / mês)</Label>
                <Input
                  type="number"
                  value={plan.price}
                  onChange={(e) => updatePlanLocal(plan.slug, { price: Number(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Duração em dias</Label>
                <Input
                  type="number"
                  value={plan.duration_days}
                  onChange={(e) => updatePlanLocal(plan.slug, { duration_days: Number(e.target.value) || 30 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Frequência de cobrança</Label>
                <Select
                  value={plan.billing_frequency || 'monthly'}
                  onValueChange={(value) => updatePlanLocal(plan.slug, { billing_frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>Plano cobrável</Label>
                <Switch
                  checked={plan.billing_enabled}
                  onCheckedChange={(value) => updatePlanLocal(plan.slug, { billing_enabled: value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Limite de veículos ativos</Label>
                <Input
                  type="number"
                  value={plan.max_vehicles}
                  onChange={(e) => updatePlanLocal(plan.slug, { max_vehicles: Number(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Importação XML</Label>
                <Switch
                  checked={plan.xml_enabled}
                  onCheckedChange={(value) => updatePlanLocal(plan.slug, { xml_enabled: value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>SDR IA</Label>
                <Switch
                  checked={plan.sdr_enabled}
                  onCheckedChange={(value) => updatePlanLocal(plan.slug, { sdr_enabled: value })}
                />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp SDR</Label>
                <Input
                  value={plan.sdr_whatsapp || ''}
                  onChange={(e) => updatePlanLocal(plan.slug, { sdr_whatsapp: e.target.value })}
                  placeholder="5531999999999"
                  disabled={!plan.sdr_enabled}
                />
              </div>
              <Button className="w-full" onClick={() => savePlan(plan)}>
                Salvar {plan.name}
              </Button>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-2xl shadow-card p-5">
          <h2 className="font-heading font-semibold text-lg mb-4">Plano por lojista</h2>
          <div className="space-y-3">
            {dealers.map((dealer) => (
              <div key={dealer.id} className="border rounded-xl p-3 space-y-3">
                <div>
                  <p className="font-medium">{dealer.name}</p>
                  <p className="text-xs text-muted-foreground">{dealer.owner_name || 'Sem nome'} • {dealer.owner_email || '-'}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                  <Select value={dealer.plan_slug} onValueChange={(value) => updateDealerPlan(dealer.id, value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um plano" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.slug} value={plan.slug}>{plan.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Preço customizado"
                    value={dealer.billing_custom_price ?? ''}
                    onChange={(e) =>
                      updateDealerBillingLocal(dealer.id, {
                        billing_custom_price: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Desconto %"
                    value={dealer.billing_discount_percent ?? ''}
                    onChange={(e) =>
                      updateDealerBillingLocal(dealer.id, {
                        billing_discount_percent: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Desconto fixo"
                    value={dealer.billing_discount_fixed ?? ''}
                    onChange={(e) =>
                      updateDealerBillingLocal(dealer.id, {
                        billing_discount_fixed: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" className="w-full" onClick={() => saveDealerBilling(dealer)}>
                      Salvar condição
                    </Button>
                    <Button className="w-full" onClick={() => chargeDealerNow(dealer)}>
                      Cobrar agora
                    </Button>
                  </div>
                </div>
                {dealer.last_charge && (
                  <p className="text-xs text-muted-foreground">
                    Última cobrança: {dealer.last_charge.status} • R$ {Number(dealer.last_charge.value || 0).toFixed(2)}
                  </p>
                )}
              </div>
            ))}
            {dealers.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum lojista encontrado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

