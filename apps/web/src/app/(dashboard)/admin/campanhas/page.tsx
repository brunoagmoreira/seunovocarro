"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Search, Filter, Edit2, Play, DollarSign, Calendar, Target, TrendingUp, BarChart3, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Campaign {
  id: string; vehicle_brand: string; vehicle_model: string; vehicle_year: number; vehicle_ad_code: string;
  seller_name: string; seller_phone: string; start_date: string; end_date: string;
  status: string; payment_status: string; total_budget: number;
  totals: { total_impressions: number; total_clicks: number; total_leads: number } | null;
}

const mockCampaigns: Campaign[] = [
  { id: '1', vehicle_brand: 'Honda', vehicle_model: 'Civic Touring', vehicle_year: 2023, vehicle_ad_code: 'AD-001', seller_name: 'Carlos Silva', seller_phone: '(31) 98888-1234', start_date: '2026-03-01', end_date: '2026-03-31', status: 'active', payment_status: 'paid', total_budget: 540, totals: { total_impressions: 45200, total_clicks: 1230, total_leads: 28 } },
  { id: '2', vehicle_brand: 'Toyota', vehicle_model: 'Corolla Altis', vehicle_year: 2024, vehicle_ad_code: 'AD-002', seller_name: 'Ana Souza', seller_phone: '(11) 97777-5678', start_date: '2026-03-10', end_date: '2026-04-10', status: 'active', payment_status: 'paid', total_budget: 360, totals: { total_impressions: 22100, total_clicks: 680, total_leads: 15 } },
  { id: '3', vehicle_brand: 'BMW', vehicle_model: '320i', vehicle_year: 2022, vehicle_ad_code: 'AD-003', seller_name: 'Pedro Autos', seller_phone: '(31) 95555-3456', start_date: '2026-02-15', end_date: '2026-03-15', status: 'completed', payment_status: 'paid', total_budget: 900, totals: { total_impressions: 78500, total_clicks: 2300, total_leads: 42 } },
  { id: '4', vehicle_brand: 'Jeep', vehicle_model: 'Compass', vehicle_year: 2023, vehicle_ad_code: 'AD-004', seller_name: 'Marina Premium', seller_phone: '(41) 96666-9012', start_date: '2026-04-01', end_date: '2026-04-30', status: 'pending', payment_status: 'pending', total_budget: 180, totals: null },
];

export default function AdminCampaignsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [campaigns] = useState<Campaign[]>(mockCampaigns);

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'active').length,
    pending: campaigns.filter(c => c.status === 'pending').length,
    totalRevenue: campaigns.filter(c => c.payment_status === 'paid').reduce((sum, c) => sum + c.total_budget, 0),
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  const getStatusBadge = (s: string) => {
    const map: Record<string, React.ReactNode> = { active: <Badge className="bg-green-500">Ativo</Badge>, completed: <Badge variant="secondary">Concluído</Badge>, paused: <Badge variant="outline">Pausado</Badge>, pending: <Badge variant="outline" className="border-amber-500 text-amber-600">Pendente</Badge>, cancelled: <Badge variant="destructive">Cancelado</Badge> };
    return map[s] || <Badge variant="outline">{s}</Badge>;
  };
  const getPaymentBadge = (s: string) => {
    const map: Record<string, React.ReactNode> = { paid: <Badge className="bg-green-500">Pago</Badge>, pending: <Badge variant="outline" className="border-amber-500 text-amber-600">Pendente</Badge>, refunded: <Badge variant="destructive">Reembolsado</Badge> };
    return map[s] || <Badge variant="outline">{s}</Badge>;
  };

  const filtered = campaigns.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!`${c.vehicle_brand} ${c.vehicle_model}`.toLowerCase().includes(s) && !c.seller_name.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild><Link href="/admin"><ArrowLeft className="h-5 w-5" /></Link></Button>
          <div><h1 className="text-2xl font-bold">Campanhas Meta Ads</h1><p className="text-muted-foreground">Gerenciar campanhas pagas de veículos</p></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><Target className="w-5 h-5 text-blue-600" /></div><div><p className="text-2xl font-bold">{stats.total}</p><p className="text-sm text-muted-foreground">Total</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center"><Play className="w-5 h-5 text-green-600" /></div><div><p className="text-2xl font-bold">{stats.active}</p><p className="text-sm text-muted-foreground">Ativas</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center"><Calendar className="w-5 h-5 text-amber-600" /></div><div><p className="text-2xl font-bold">{stats.pending}</p><p className="text-sm text-muted-foreground">Pendentes</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><DollarSign className="w-5 h-5 text-primary" /></div><div><p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p><p className="text-sm text-muted-foreground">Receita</p></div></div></CardContent></Card>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar por veículo ou vendedor..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" /></div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48"><Filter className="w-4 h-4 mr-2" /><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="pending">Pendentes</SelectItem><SelectItem value="active">Ativos</SelectItem><SelectItem value="paused">Pausados</SelectItem><SelectItem value="completed">Concluídos</SelectItem></SelectContent>
          </Select>
          <Button onClick={() => toast.info('Funcionalidade em desenvolvimento')}><Plus className="w-4 h-4 mr-2" />Nova Campanha</Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Código</TableHead><TableHead>Veículo</TableHead><TableHead>Vendedor</TableHead><TableHead>Período</TableHead><TableHead>Status</TableHead><TableHead>Pagamento</TableHead><TableHead>Métricas</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell><Badge variant="secondary" className="font-mono">{c.vehicle_ad_code}</Badge></TableCell>
                      <TableCell><div className="font-medium">{c.vehicle_brand} {c.vehicle_model}</div><div className="text-sm text-muted-foreground">{c.vehicle_year}</div></TableCell>
                      <TableCell><div className="font-medium">{c.seller_name}</div><div className="text-sm text-muted-foreground">{c.seller_phone}</div></TableCell>
                      <TableCell><div className="text-sm">{new Date(c.start_date).toLocaleDateString('pt-BR')}</div><div className="text-sm text-muted-foreground">até {new Date(c.end_date).toLocaleDateString('pt-BR')}</div></TableCell>
                      <TableCell>{getStatusBadge(c.status)}</TableCell>
                      <TableCell>{getPaymentBadge(c.payment_status)}</TableCell>
                      <TableCell>{c.totals ? (<div className="text-xs space-y-0.5"><div className="flex justify-between gap-4"><span className="text-muted-foreground">Impressões:</span><span className="font-medium">{c.totals.total_impressions.toLocaleString()}</span></div><div className="flex justify-between gap-4"><span className="text-muted-foreground">Cliques:</span><span className="font-medium">{c.totals.total_clicks.toLocaleString()}</span></div><div className="flex justify-between gap-4"><span className="text-muted-foreground">Leads:</span><span className="font-medium text-green-600">{c.totals.total_leads}</span></div></div>) : (<span className="text-muted-foreground text-sm">Sem dados</span>)}</TableCell>
                      <TableCell className="text-right"><div className="flex items-center justify-end gap-2"><Button variant="ghost" size="icon" onClick={() => toast.info('Em desenvolvimento')} title="Métricas"><BarChart3 className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => toast.info('Em desenvolvimento')} title="Editar"><Edit2 className="h-4 w-4" /></Button></div></TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (<TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhuma campanha encontrada</TableCell></TableRow>)}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
