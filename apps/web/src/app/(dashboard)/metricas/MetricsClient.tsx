"use client";

import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Calendar, Eye, MessageCircle, Car } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface VehicleMetricRow {
  id: string;
  brand: string;
  model: string;
  year: number;
  slug: string;
  status: string;
  views: number;
  whatsapp_clicks: number;
}

interface UtmMetricRow {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  count: number;
}

interface MetricsResponse {
  period_days: number;
  summary: {
    total_vehicles: number;
    total_views: number;
    whatsapp_clicks: number;
  };
  vehicles: VehicleMetricRow[];
  utm: {
    vehicle_views: UtmMetricRow[];
    whatsapp_clicks: UtmMetricRow[];
  };
}

function UtmTable({ title, rows }: { title: string; rows: UtmMetricRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum UTM registrado no período.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2 pr-3 text-left font-medium">Source</th>
                  <th className="py-2 pr-3 text-left font-medium">Medium</th>
                  <th className="py-2 pr-3 text-left font-medium">Campaign</th>
                  <th className="py-2 text-right font-medium">Qtd</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={`${row.utm_source}-${row.utm_medium}-${row.utm_campaign}-${idx}`} className="border-b border-border/50">
                    <td className="py-2 pr-3">{row.utm_source}</td>
                    <td className="py-2 pr-3">{row.utm_medium}</td>
                    <td className="py-2 pr-3">{row.utm_campaign}</td>
                    <td className="py-2 text-right font-medium">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function MetricsClient() {
  const [period, setPeriod] = useState('30');
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<MetricsResponse | null>(null);

  useEffect(() => {
    const run = async () => {
      setIsLoading(true);
      try {
        const res = await fetchApi<MetricsResponse>('/vehicles/metrics', {
          params: { period },
          requireAuth: true,
        });
        setData(res);
      } finally {
        setIsLoading(false);
      }
    };
    void run();
  }, [period]);

  const vehicles = useMemo(() => {
    if (!data?.vehicles) return [];
    return [...data.vehicles].sort((a, b) => {
      if (b.views !== a.views) return b.views - a.views;
      return b.whatsapp_clicks - a.whatsapp_clicks;
    });
  }, [data?.vehicles]);

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

  return (
    <div className="min-h-screen pb-24 md:pb-8 pt-16">
      <div className="container py-6 space-y-6">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-4">
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

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Eye className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{data?.summary.total_views || 0}</p>
                  <p className="text-xs text-muted-foreground">Total de views (seus veículos)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <MessageCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{data?.summary.whatsapp_clicks || 0}</p>
                  <p className="text-xs text-muted-foreground">Cliques WhatsApp</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg gradient-brand-soft">
                  <Car className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{data?.summary.total_vehicles || 0}</p>
                  <p className="text-xs text-muted-foreground">Veículos do lojista</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5" />
              Views e cliques por veículo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!vehicles.length ? (
              <p className="text-sm text-muted-foreground">Nenhum veículo encontrado para o período.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="py-2 pr-3 text-left font-medium">Veículo</th>
                      <th className="py-2 pr-3 text-left font-medium">Status</th>
                      <th className="py-2 text-right font-medium">Views</th>
                      <th className="py-2 text-right font-medium">Cliques WPP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((v) => (
                      <tr key={v.id} className="border-b border-border/50">
                        <td className="py-2 pr-3">
                          {v.brand} {v.model} {v.year}
                        </td>
                        <td className="py-2 pr-3">{v.status}</td>
                        <td className="py-2 text-right font-medium">{v.views}</td>
                        <td className="py-2 text-right font-medium">{v.whatsapp_clicks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <UtmTable title="UTM Views de Veículos" rows={data?.utm.vehicle_views || []} />
          <UtmTable title="UTM Cliques de WhatsApp" rows={data?.utm.whatsapp_clicks || []} />
        </div>
      </div>
    </div>
  );
}
