"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Eye, MessageSquare, UserPlus, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { toast } from 'sonner';

const mockTimeSeries = [
  { date: '20/03', views: 180, leads: 8, signups: 1 }, { date: '21/03', views: 220, leads: 12, signups: 2 },
  { date: '22/03', views: 310, leads: 15, signups: 1 }, { date: '23/03', views: 280, leads: 18, signups: 3 },
  { date: '24/03', views: 420, leads: 22, signups: 2 }, { date: '25/03', views: 380, leads: 20, signups: 4 },
  { date: '26/03', views: 510, leads: 28, signups: 3 }, { date: '27/03', views: 460, leads: 25, signups: 2 },
  { date: '28/03', views: 540, leads: 30, signups: 5 }, { date: '29/03', views: 590, leads: 34, signups: 6 },
];

const mockCampaignMetrics = [
  { campaign: 'Promo_Semana_Consumidor', source: 'google', views: 2400, leads: 85, signups: 12, conversionRate: 3.54 },
  { campaign: 'Retargeting_BH', source: 'facebook', views: 1800, leads: 62, signups: 8, conversionRate: 3.44 },
  { campaign: 'Orgânico/Direto', source: 'direto', views: 3200, leads: 45, signups: 18, conversionRate: 1.41 },
  { campaign: 'Instagram_Stories', source: 'instagram', views: 980, leads: 38, signups: 5, conversionRate: 3.88 },
  { campaign: 'Google_Search_BH', source: 'google', views: 1500, leads: 52, signups: 7, conversionRate: 3.47 },
];

export default function AdminUTMReportsPage() {
  const [period, setPeriod] = useState('30');

  const summaryStats = { totalViews: 9880, totalLeads: 282, totalSignups: 50, overallConversionRate: 2.85 };

  const statCards = [
    { label: 'Views', value: summaryStats.totalViews.toLocaleString('pt-BR'), icon: Eye, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { label: 'Leads', value: summaryStats.totalLeads.toLocaleString('pt-BR'), icon: MessageSquare, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    { label: 'Cadastros', value: summaryStats.totalSignups.toLocaleString('pt-BR'), icon: UserPlus, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    { label: 'Taxa de Conversão', value: `${summaryStats.overallConversionRate.toFixed(2)}%`, icon: TrendingUp, color: 'text-primary', bgColor: 'bg-primary/10' },
  ];

  const barChartData = mockCampaignMetrics.slice(0, 8).map(c => ({ name: c.campaign.length > 15 ? c.campaign.substring(0, 15) + '...' : c.campaign, Views: c.views, Leads: c.leads }));

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild><Link href="/admin"><ArrowLeft className="h-5 w-5" /></Link></Button>
            <h1 className="font-heading text-2xl font-bold">Relatórios UTM</h1>
          </div>
          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]"><Calendar className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="7">Últimos 7 dias</SelectItem><SelectItem value="30">Últimos 30 dias</SelectItem><SelectItem value="90">Últimos 90 dias</SelectItem></SelectContent>
            </Select>
            <Button variant="outline" onClick={() => toast.success('CSV exportado!')}><Download className="h-4 w-4 mr-2" />Exportar CSV</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <div key={stat.label} className="bg-card rounded-2xl p-4 shadow-card">
              <div className="flex items-center gap-3 mb-2"><div className={`p-2 rounded-lg ${stat.bgColor}`}><stat.icon className={`h-5 w-5 ${stat.color}`} /></div></div>
              <p className="font-heading text-2xl font-bold">{stat.value}</p>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h2 className="font-heading font-semibold mb-4 flex items-center gap-2"><BarChart3 className="h-5 w-5" />Evolução Temporal</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockTimeSeries}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} name="Views" dot={false} />
                  <Line type="monotone" dataKey="leads" stroke="#a855f7" strokeWidth={2} name="Leads" dot={false} />
                  <Line type="monotone" dataKey="signups" stroke="#22c55e" strokeWidth={2} name="Cadastros" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h2 className="font-heading font-semibold mb-4 flex items-center gap-2"><TrendingUp className="h-5 w-5" />Comparativo de Campanhas</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={100} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="Views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="Leads" fill="#a855f7" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-card">
          <h2 className="font-heading font-semibold mb-4">Detalhamento por Campanha</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead className="min-w-[200px]">Campanha</TableHead><TableHead>Source</TableHead><TableHead className="text-right">Views</TableHead><TableHead className="text-right">Leads</TableHead><TableHead className="text-right">Conv. %</TableHead><TableHead className="text-right">Cadastros</TableHead></TableRow></TableHeader>
              <TableBody>
                {mockCampaignMetrics.map((campaign, index) => (
                  <TableRow key={campaign.campaign}>
                    <TableCell className="font-medium"><div className="flex items-center gap-2">{index < 3 && (<Badge variant={index === 0 ? 'default' : 'secondary'}>#{index + 1}</Badge>)}<span className="truncate max-w-[180px]">{campaign.campaign}</span></div></TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{campaign.source}</Badge></TableCell>
                    <TableCell className="text-right font-mono">{campaign.views.toLocaleString('pt-BR')}</TableCell>
                    <TableCell className="text-right font-mono">{campaign.leads.toLocaleString('pt-BR')}</TableCell>
                    <TableCell className="text-right"><Badge variant="outline" className={campaign.conversionRate >= 3.5 ? 'bg-green-500/10 text-green-600 border-green-200' : 'bg-yellow-500/10 text-yellow-600 border-yellow-200'}>{campaign.conversionRate.toFixed(2)}%</Badge></TableCell>
                    <TableCell className="text-right font-mono">{campaign.signups.toLocaleString('pt-BR')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
