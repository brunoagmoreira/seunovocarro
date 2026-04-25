"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Download,
  Eye,
  MessageSquare,
  TrendingUp,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { toast } from 'sonner';
import { fetchApi } from '@/lib/api';

type VehicleMetric = {
  vehicle_id: string;
  brand: string;
  model: string;
  year: number;
  status: string;
  seller_id: string;
  views: number;
  whatsapp_clicks: number;
};

type UTMSource = {
  source: string;
  count: number;
};

type UTMCampaign = {
  campaign: string;
  count: number;
};

type AdminMetricsResponse = {
  period_days: number;
  home_views: number;
  total_vehicle_views: number;
  total_whatsapp_clicks: number;
  vehicle_metrics: VehicleMetric[];
  utm: {
    by_source: UTMSource[];
    by_campaign: UTMCampaign[];
  };
};

export default function AdminUTMReportsPage() {
  const [period, setPeriod] = useState('30');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AdminMetricsResponse | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const response = await fetchApi<AdminMetricsResponse>('/admin/metrics', {
          params: { period },
          requireAuth: true,
        });
        setData(response);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Falha ao carregar métricas';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [period]);

  const vehicleMetrics = useMemo(
    () => [...(data?.vehicle_metrics || [])].sort((a, b) => b.views - a.views),
    [data?.vehicle_metrics],
  );

  const sourceChartData = (data?.utm.by_source || []).map((row) => ({
    name: row.source.length > 20 ? `${row.source.slice(0, 20)}...` : row.source,
    Eventos: row.count,
  }));

  const campaignChartData = (data?.utm.by_campaign || []).map((row) => ({
    name: row.campaign.length > 20 ? `${row.campaign.slice(0, 20)}...` : row.campaign,
    Eventos: row.count,
  }));

  const summaryStats = {
    totalViews: data?.total_vehicle_views || 0,
    totalWhatsAppClicks: data?.total_whatsapp_clicks || 0,
    homeViews: data?.home_views || 0,
    totalVehicles: vehicleMetrics.length,
  };

  const exportCSV = () => {
    if (!vehicleMetrics.length) {
      toast.info('Sem dados para exportar no período selecionado.');
      return;
    }

    const header = ['Veiculo', 'Status', 'Views', 'Cliques_WhatsApp'];
    const rows = vehicleMetrics.map((item) => [
      `${item.brand} ${item.model} ${item.year}`,
      item.status,
      String(item.views),
      String(item.whatsapp_clicks),
    ]);

    const content = [header, ...rows]
      .map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-utm-${period}dias.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('CSV exportado!');
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="font-heading text-2xl font-bold">Relatórios UTM</h1>
          </div>
          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="365">Últimos 365 dias</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-2xl p-4 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Eye className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <p className="font-heading text-2xl font-bold">{summaryStats.totalViews.toLocaleString('pt-BR')}</p>
            <span className="text-sm text-muted-foreground">Views de veículos</span>
          </div>

          <div className="bg-card rounded-2xl p-4 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <MessageSquare className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <p className="font-heading text-2xl font-bold">{summaryStats.totalWhatsAppClicks.toLocaleString('pt-BR')}</p>
            <span className="text-sm text-muted-foreground">Cliques no WhatsApp</span>
          </div>

          <div className="bg-card rounded-2xl p-4 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            <p className="font-heading text-2xl font-bold">{summaryStats.homeViews.toLocaleString('pt-BR')}</p>
            <span className="text-sm text-muted-foreground">Home views</span>
          </div>

          <div className="bg-card rounded-2xl p-4 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="font-heading text-2xl font-bold">{summaryStats.totalVehicles.toLocaleString('pt-BR')}</p>
            <span className="text-sm text-muted-foreground">Veículos com dados</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h2 className="font-heading font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              UTM por Source/Medium
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourceChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="Eventos" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h2 className="font-heading font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              UTM por Campanha
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaignChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="Eventos" fill="#a855f7" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-card">
          <h2 className="font-heading font-semibold mb-4">Detalhamento por Veículo</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[220px]">Veículo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Cliques WPP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Carregando métricas...
                    </TableCell>
                  </TableRow>
                ) : vehicleMetrics.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Nenhum dado disponível no período selecionado.
                    </TableCell>
                  </TableRow>
                ) : (
                  vehicleMetrics.map((item, index) => (
                    <TableRow key={item.vehicle_id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {index < 3 && <Badge variant={index === 0 ? 'default' : 'secondary'}>#{index + 1}</Badge>}
                          <span>
                            {item.brand} {item.model} {item.year}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {item.views.toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {item.whatsapp_clicks.toLocaleString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
