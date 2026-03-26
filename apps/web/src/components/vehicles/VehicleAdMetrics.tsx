import Link from 'next/link';
import { 
  TrendingUp, Eye, MousePointer, DollarSign, 
  Users, Target, Calendar, BarChart3, Zap, Rocket
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useVehicleAdCampaign, useVehicleAdMetrics } from '@/hooks/useAdMetrics';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface VehicleAdMetricsProps {
  vehicleId: string;
}

export function VehicleAdMetrics({ vehicleId }: VehicleAdMetricsProps) {
  const { data: campaign, isLoading } = useVehicleAdCampaign(vehicleId);
  const { data: dailyMetrics } = useVehicleAdMetrics(campaign?.id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <Card className="border-dashed border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Rocket className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">Turbine suas vendas!</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Anuncie este veículo no Instagram e Facebook a partir de <strong className="text-primary">R$ 247/mês</strong>
          </p>
          <Button className="bg-primary hover:bg-primary/90" asChild>
            <Link href="/impulsionar">
              <Zap className="w-4 h-4 mr-2" />
              Ver Planos de Impulsionamento
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totals = campaign.totals?.[0];
  const daysRemaining = campaign.end_date 
    ? Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;
  const progress = campaign.days_total > 0 
    ? ((campaign.days_total - daysRemaining) / campaign.days_total) * 100 
    : 0;

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

  const formatNumber = (value: number) => 
    new Intl.NumberFormat('pt-BR').format(value || 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">🟢 Ativo</Badge>;
      case 'completed':
        return <Badge variant="secondary">✅ Concluído</Badge>;
      case 'paused':
        return <Badge variant="outline">⏸️ Pausado</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-amber-500 text-amber-600">⏳ Pendente</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">❌ Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Campanha Meta Ads</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(campaign.start_date).toLocaleDateString('pt-BR')} - {new Date(campaign.end_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            {getStatusBadge(campaign.status)}
          </div>

          {/* Progress */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso da campanha</span>
              <span className="font-medium">{daysRemaining} dias restantes</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Budget */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Orçamento</p>
              <p className="text-xl font-bold">{formatCurrency(campaign.total_budget)}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Gasto</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(totals?.total_spend || 0)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard 
          icon={Eye} 
          label="Impressões" 
          value={formatNumber(totals?.total_impressions || 0)} 
          color="blue"
        />
        <MetricCard 
          icon={Users} 
          label="Alcance" 
          value={formatNumber(totals?.total_reach || 0)} 
          color="purple"
        />
        <MetricCard 
          icon={MousePointer} 
          label="Cliques" 
          value={formatNumber(totals?.total_clicks || 0)} 
          color="green"
        />
        <MetricCard 
          icon={TrendingUp} 
          label="CTR" 
          value={`${((totals?.avg_ctr || 0) * 100).toFixed(2)}%`} 
          color="amber"
        />
      </div>

      {/* Conversion Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard 
          icon={DollarSign} 
          label="Custo por Clique" 
          value={formatCurrency(totals?.avg_cpc || 0)} 
          color="teal"
          highlight
        />
        <MetricCard 
          icon={Users} 
          label="Leads Gerados" 
          value={formatNumber(totals?.total_leads || 0)} 
          color="primary"
          highlight
        />
        <MetricCard 
          icon={Target} 
          label="Custo por Lead" 
          value={formatCurrency(totals?.avg_cost_per_lead || 0)} 
          color="green"
          highlight
        />
      </div>

      {/* Daily Chart */}
      {dailyMetrics && dailyMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-5 h-5 text-primary" />
              Desempenho Diário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyMetrics}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString('pt-BR')}
                    formatter={(value: number, name: string) => [
                      name === 'spend' ? formatCurrency(value) : formatNumber(value),
                      name === 'impressions' ? 'Impressões' :
                      name === 'clicks' ? 'Cliques' :
                      name === 'spend' ? 'Gasto' :
                      name === 'leads' ? 'Leads' : name
                    ]}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="impressions" name="Impressões" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="clicks" name="Cliques" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="leads" name="Leads" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                Impressões
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                Cliques
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                Leads
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  color,
  highlight = false 
}: { 
  icon: any; 
  label: string; 
  value: string; 
  color: string;
  highlight?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-600',
    purple: 'bg-purple-500/10 text-purple-600',
    green: 'bg-green-500/10 text-green-600',
    amber: 'bg-amber-500/10 text-amber-600',
    teal: 'bg-teal-500/10 text-teal-600',
    primary: 'bg-primary/10 text-primary',
  };

  return (
    <Card className={highlight ? 'border-primary/30 bg-primary/5' : ''}>
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color] || colorClasses.blue}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xl font-bold truncate">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
