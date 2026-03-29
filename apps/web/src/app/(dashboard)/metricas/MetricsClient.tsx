"use client";

import { useState, useEffect } from 'react';
import { Eye, MessageSquare, TrendingUp, Car, BarChart3, Calendar, Target, DollarSign, MousePointer, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
// TODO: Replace with Next.js API abstraction in backend migration phase
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAllVehicleAdCampaigns } from '@/hooks/useAdMetrics';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VehicleMetrics {
  id: string;
  brand: string;
  model: string;
  year: number;
  status: string;
  views: number;
  leads: number;
  conversionRate: number;
  dailyViews: { date: string; views: number }[];
}

export function MetricsClient() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  const [vehicleMetrics, setVehicleMetrics] = useState<VehicleMetrics[]>([]);
  const [totals, setTotals] = useState({
    vehicles: 0,
    views: 0,
    leads: 0,
    conversionRate: 0,
    activeVehicles: 0,
    soldVehicles: 0,
  });

  const { data: adCampaigns, isLoading: isLoadingCampaigns } = useAllVehicleAdCampaigns(user?.id);

  // Calculate ad totals
  const adTotals = adCampaigns?.reduce((acc: any, campaign: any) => {
    const totals = campaign.totals?.[0] || {};
    return {
      impressions: (acc.impressions || 0) + (totals.total_impressions || 0),
      reach: (acc.reach || 0) + (totals.total_reach || 0),
      clicks: (acc.clicks || 0) + (totals.total_clicks || 0),
      spend: (acc.spend || 0) + (totals.total_spend || 0),
      leads: (acc.leads || 0) + (totals.total_leads || 0),
      activeCampaigns: (acc.activeCampaigns || 0) + (campaign.status === 'active' ? 1 : 0)
    };
  }, { impressions: 0, reach: 0, clicks: 0, spend: 0, leads: 0, activeCampaigns: 0 }) || { impressions: 0, reach: 0, clicks: 0, spend: 0, leads: 0, activeCampaigns: 0 };

  useEffect(() => {
    if (user) {
      fetchMetrics();
    }
  }, [user, period]);

  const fetchMetrics = async () => {
    setIsLoading(true);

    const { data: vehicles } = await supabase
      .from('vehicles')
      .select('id, brand, model, year, status')
      .eq('user_id', user?.id);

    if (!vehicles?.length) {
      setIsLoading(false);
      return;
    }

    const vehicleIds = vehicles.map((v: any) => v.id);
    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    const { data: viewsData } = await (supabase as any)
      .from('vehicle_views')
      .select('vehicle_id, created_at')
      .in('vehicle_id', vehicleIds)
      .gte('created_at', startDate.toISOString());

    const { data: leadsData } = await supabase
      .from('leads')
      .select('vehicle_id')
      .in('vehicle_id', vehicleIds)
      .gte('created_at', startDate.toISOString());

    const allDates: string[] = [];
    for (let i = periodDays - 1; i >= 0; i--) {
      allDates.push(format(subDays(new Date(), i), 'yyyy-MM-dd'));
    }

    const metrics: VehicleMetrics[] = vehicles.map(vehicle => {
      const vehicleViews = viewsData?.filter(v => v.vehicle_id === vehicle.id) || [];
      const views = vehicleViews.length;
      const leads = leadsData?.filter(l => l.vehicle_id === vehicle.id).length || 0;
      const conversionRate = views > 0 ? (leads / views) * 100 : 0;

      const viewsByDate: Record<string, number> = {};
      vehicleViews.forEach(v => {
        const date = format(parseISO(v.created_at), 'yyyy-MM-dd');
        viewsByDate[date] = (viewsByDate[date] || 0) + 1;
      });

      const dailyViews = allDates.map(date => ({
        date,
        views: viewsByDate[date] || 0,
      }));

      return {
        ...vehicle,
        views,
        leads,
        conversionRate,
        dailyViews,
      };
    });

    metrics.sort((a, b) => b.views - a.views);

    setVehicleMetrics(metrics);

    const totalViews = metrics.reduce((sum, v) => sum + v.views, 0);
    const totalLeads = metrics.reduce((sum, v) => sum + v.leads, 0);

    setTotals({
      vehicles: vehicles.length,
      views: totalViews,
      leads: totalLeads,
      conversionRate: totalViews > 0 ? (totalLeads / totalViews) * 100 : 0,
      activeVehicles: vehicles.filter(v => v.status === 'approved').length,
      soldVehicles: vehicles.filter(v => v.status === 'sold').length,
    });

    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="container py-8 pt-24">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

  return (
    <div className="min-h-screen pb-24 md:pb-8 pt-16">
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h1 className="font-heading text-2xl font-bold">Métricas</h1>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="organic" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="organic">Orgânico</TabsTrigger>
            <TabsTrigger value="ads">Meta Ads</TabsTrigger>
          </TabsList>

          <TabsContent value="organic" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <div className="bg-card rounded-xl p-4 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg gradient-kairos-soft">
                    <Car className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totals.vehicles}</p>
                    <p className="text-xs text-muted-foreground">Veículos</p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl p-4 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Car className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totals.activeVehicles}</p>
                    <p className="text-xs text-muted-foreground">Ativos</p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl p-4 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg gradient-kairos-soft">
                    <Car className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totals.soldVehicles}</p>
                    <p className="text-xs text-muted-foreground">Vendidos</p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl p-4 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Eye className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totals.views}</p>
                    <p className="text-xs text-muted-foreground">Visualizações</p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl p-4 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totals.leads}</p>
                    <p className="text-xs text-muted-foreground">Leads</p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl p-4 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <TrendingUp className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totals.conversionRate.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">Conversão</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Visualizações por Veículo
              </h2>

              {vehicleMetrics.length === 0 ? (
                <Card>
                  <CardContent className="py-8">
                    <p className="text-muted-foreground text-center">
                      Nenhum dado disponível para o período selecionado.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {vehicleMetrics.map((vehicle) => (
                    <Card key={vehicle.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base font-medium">
                            {vehicle.brand} {vehicle.model}{' '}
                            <span className="text-muted-foreground font-normal">{vehicle.year}</span>
                          </CardTitle>
                          <Badge 
                            variant={vehicle.status === 'approved' ? 'default' : 'secondary'}
                            className={vehicle.status === 'approved' ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' : ''}
                          >
                            {vehicle.status === 'approved' ? 'Ativo' : 
                             vehicle.status === 'sold' ? 'Vendido' : vehicle.status}
                          </Badge>
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            {vehicle.views} views
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3.5 w-3.5" />
                            {vehicle.leads} leads
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3.5 w-3.5" />
                            {vehicle.conversionRate.toFixed(1)}%
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <div className="h-[160px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={vehicle.dailyViews}
                              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                            >
                              <defs>
                                <linearGradient id={`gradient-${vehicle.id}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                              <XAxis 
                                dataKey="date" 
                                tickFormatter={(value) => format(parseISO(value), 'dd/MM', { locale: ptBR })}
                                tick={{ fontSize: 11 }}
                                className="text-muted-foreground"
                                interval="preserveStartEnd"
                              />
                              <YAxis 
                                tick={{ fontSize: 11 }}
                                className="text-muted-foreground"
                                allowDecimals={false}
                              />
                              <Tooltip 
                                content={({ active, payload, label }) => {
                                  if (active && payload && payload.length) {
                                    return (
                                      <div className="bg-popover border border-border rounded-lg p-2 shadow-lg">
                                        <p className="text-xs text-muted-foreground">
                                          {format(parseISO(String(label)), "dd 'de' MMMM", { locale: ptBR })}
                                        </p>
                                        <p className="text-sm font-medium">
                                          {payload[0].value} visualizações
                                        </p>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Area
                                type="monotone"
                                dataKey="views"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                fill={`url(#gradient-${vehicle.id})`}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="ads" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <Target className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{adTotals.activeCampaigns}</p>
                      <p className="text-xs text-muted-foreground">Campanhas Ativas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Eye className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{adTotals.impressions.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Impressões</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/10">
                      <Users className="h-5 w-5 text-cyan-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{adTotals.reach.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Alcance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <MousePointer className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{adTotals.clicks.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Cliques</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <MessageSquare className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{adTotals.leads}</p>
                      <p className="text-xs text-muted-foreground">Leads</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/10">
                      <DollarSign className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{formatCurrency(adTotals.spend)}</p>
                      <p className="text-xs text-muted-foreground">Gasto Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5" />
                  Performance por Campanha
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingCampaigns ? (
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-muted rounded-xl" />
                    ))}
                  </div>
                ) : !adCampaigns?.length ? (
                  <p className="text-muted-foreground text-center py-8">
                    Você ainda não possui campanhas de anúncios.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Veículo</th>
                          <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                          <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Impressões</th>
                          <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Cliques</th>
                          <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Leads</th>
                          <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Gasto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adCampaigns.map((campaign: any) => {
                          const totals = campaign.totals?.[0] || {};
                          return (
                            <tr key={campaign.id} className="border-b border-border/50 hover:bg-muted/30">
                              <td className="py-3 px-2">
                                <div className="flex items-center gap-2">
                                  {campaign.vehicle?.ad_code && (
                                    <Badge variant="secondary" className="font-mono text-xs">
                                      {campaign.vehicle.ad_code}
                                    </Badge>
                                  )}
                                  <div>
                                    <span className="font-medium">
                                      {campaign.vehicle?.brand} {campaign.vehicle?.model}
                                    </span>
                                    <span className="text-muted-foreground text-sm ml-1">
                                      {campaign.vehicle?.year}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="text-center py-3 px-2">
                                <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                                  {campaign.status === 'active' ? 'Ativo' : 
                                   campaign.status === 'paused' ? 'Pausado' : 
                                   campaign.status === 'completed' ? 'Concluído' : campaign.status}
                                </Badge>
                              </td>
                              <td className="text-center py-3 px-2 font-medium">
                                {(totals.total_impressions || 0).toLocaleString()}
                              </td>
                              <td className="text-center py-3 px-2 font-medium">
                                {(totals.total_clicks || 0).toLocaleString()}
                              </td>
                              <td className="text-center py-3 px-2 font-medium text-green-600">
                                {totals.total_leads || 0}
                              </td>
                              <td className="text-center py-3 px-2 font-medium">
                                {formatCurrency(totals.total_spend || 0)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
