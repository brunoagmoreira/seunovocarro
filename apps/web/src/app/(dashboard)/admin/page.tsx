"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Car, MessageSquare, Eye, Clock, ArrowRight, Settings, TrendingUp, UserPlus, Calendar, BarChart3, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface DashboardStats {
  totalVehicles: number;
  pendingVehicles: number;
  totalUsers: number;
  pendingEditors: number;
  totalLeads: number;
  totalViews: number;
  newUsersToday: number;
  leadsToday: number;
  viewsToday: number;
  conversionRate: number;
}

interface PendingItem {
  id: string;
  title: string;
  subtitle: string;
  created_at: string;
  type: 'vehicle' | 'editor';
}

interface ChartData {
  date: string;
  views: number;
  leads: number;
  signups: number;
}

interface SourceData {
  source: string;
  count: number;
}

interface CampaignData {
  campaign: string;
  leads: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalVehicles: 0,
    pendingVehicles: 0,
    totalUsers: 0,
    pendingEditors: 0,
    totalLeads: 0,
    totalViews: 0,
    newUsersToday: 0,
    leadsToday: 0,
    viewsToday: 0,
    conversionRate: 0,
  });
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [sourceData, setSourceData] = useState<SourceData[]>([]);
  const [campaignData, setCampaignData] = useState<CampaignData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('7');

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    // Para manter o visual intacto da Lovable sem quebrar a Build do Next.js
    // Substituimos as chamadas do supabase antigo por Mock Data estético perfeito.
    // Numa fase futura do roadmap, ligaremos essas variáveis aos GET da nossa API Nest.
    
    setTimeout(() => {
      setStats({
        totalVehicles: 0,
        pendingVehicles: 0,
        totalUsers: 0,
        pendingEditors: 0,
        totalLeads: 0,
        totalViews: 0,
        newUsersToday: 0,
        leadsToday: 0,
        viewsToday: 0,
        conversionRate: 0,
      });

      setChartData([]);
      setSourceData([]);
      setCampaignData([]);
      setPendingItems([]);

      setIsLoading(false);
    }, 400);
  };

  const statCards = [
    { label: 'Veículos', value: stats.totalVehicles, icon: Car, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { label: 'Pendentes', value: stats.pendingVehicles, icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
    { label: 'Usuários', value: stats.totalUsers, icon: Users, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    { label: 'Leads', value: stats.totalLeads, icon: MessageSquare, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    { label: 'Visualizações', value: stats.totalViews, icon: Eye, color: 'text-primary', bgColor: 'gradient-kairos-soft' },
  ];

  const todayCards = [
    { label: 'Novos Usuários', value: stats.newUsersToday, icon: UserPlus, color: 'text-green-500' },
    { label: 'Leads Hoje', value: stats.leadsToday, icon: MessageSquare, color: 'text-purple-500' },
    { label: 'Views Hoje', value: stats.viewsToday, icon: Eye, color: 'text-blue-500' },
    { label: 'Taxa Conversão', value: `${stats.conversionRate.toFixed(1)}%`, icon: TrendingUp, color: 'text-amber-500' },
  ];

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h1 className="font-heading text-2xl font-bold">Dashboard Admin</h1>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {statCards.map((stat) => (
            <div key={stat.label} className="bg-card rounded-2xl p-4 shadow-card">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <p className="font-heading text-2xl font-bold">{stat.value}</p>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Today Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {todayCards.map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl p-4 shadow-card border-l-4 border-l-primary flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Activity Chart */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h2 className="font-heading font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Atividade
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} name="Views" dot={false} />
                  <Line type="monotone" dataKey="leads" stroke="#a855f7" strokeWidth={2} name="Leads" dot={false} />
                  <Line type="monotone" dataKey="signups" stroke="#22c55e" strokeWidth={2} name="Cadastros" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Leads by Source */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h2 className="font-heading font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Leads por Fonte
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="source" type="category" tick={{ fontSize: 12 }} width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Leads" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Campaign Performance */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h2 className="font-heading font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance por Campanha
            </h2>
            <div className="space-y-3">
              {campaignData.slice(0, 5).map((campaign, index) => (
                <div key={campaign.campaign} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20 text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium truncate max-w-[200px]">{campaign.campaign}</span>
                  </div>
                  <Badge variant="secondary">{campaign.leads} leads</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Button variant="outline" size="lg" className="justify-between" asChild>
            <Link href="/admin/veiculos">
              <span className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Veículos
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="justify-between" asChild>
            <Link href="/admin/usuarios">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Usuários
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="justify-between" asChild>
            <Link href="/admin/leads">
              <span className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Leads
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="justify-between" asChild>
            <Link href="/admin/campanhas">
              <span className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Ads
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="justify-between" asChild>
            <Link href="/admin/relatorios-utm">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                UTM
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="justify-between" asChild>
            <Link href="/admin/configuracoes">
              <span className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Config
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Pending Items */}
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <h2 className="font-heading font-semibold mb-4">Pendentes de Aprovação</h2>
          <div className="space-y-3">
            {pendingItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{item.title}</p>
                    <Badge variant={item.type === 'vehicle' ? 'default' : 'secondary'}>
                      {item.type === 'vehicle' ? 'Veículo' : 'Editor'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={item.type === 'vehicle' ? '/admin/veiculos' : '/admin/usuarios'}>
                    Revisar
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
