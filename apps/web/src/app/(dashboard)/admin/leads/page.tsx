"use client";

import { useState, useEffect } from 'react';
import { MessageSquare, Phone, Mail, Calendar, Search, X, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface LeadWithVehicle {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  source: string;
  created_at: string;
  vehicle_id: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  vehicles: {
    brand: string;
    model: string;
    year: number;
    sellerName: string | null;
  } | null;
}

const ALL_VALUE = '__all__';

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadWithVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState<string>(ALL_VALUE);
  const [filterPeriod, setFilterPeriod] = useState<string>(ALL_VALUE);

  useEffect(() => {
    setTimeout(() => {
      setLeads([
        { id: '1', name: 'Ricardo Mendes', phone: '(31) 99876-5432', email: 'ricardo@email.com', source: 'whatsapp', created_at: new Date().toISOString(), vehicle_id: 'v1', utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'Promo_Semana', vehicles: { brand: 'Honda', model: 'Civic Touring', year: 2023, sellerName: 'Carlos Silva Motors' } },
        { id: '2', name: 'Fernanda Oliveira', phone: '(11) 98765-1234', email: 'fer@email.com', source: 'form', created_at: new Date(Date.now() - 86400000).toISOString(), vehicle_id: 'v2', utm_source: 'instagram', utm_medium: 'social', utm_campaign: 'Retargeting_SP', vehicles: { brand: 'Toyota', model: 'Corolla Altis', year: 2024, sellerName: 'Ana Souza Veículos' } },
        { id: '3', name: 'Marcos Paulo', phone: '(21) 97654-3210', email: null, source: 'whatsapp', created_at: new Date(Date.now() - 172800000).toISOString(), vehicle_id: 'v3', utm_source: null, utm_medium: null, utm_campaign: null, vehicles: { brand: 'Volkswagen', model: 'Polo Highline', year: 2024, sellerName: 'Carlos Silva Motors' } },
        { id: '4', name: 'Juliana Rodrigues', phone: '(41) 96543-2109', email: 'juliana@mail.com', source: 'phone', created_at: new Date(Date.now() - 259200000).toISOString(), vehicle_id: 'v4', utm_source: 'facebook', utm_medium: 'cpc', utm_campaign: 'Promo_Semana', vehicles: { brand: 'Jeep', model: 'Compass Limited', year: 2023, sellerName: 'Marina Premium Cars' } },
        { id: '5', name: 'André Costa', phone: '(61) 95432-1098', email: 'andre.c@email.com', source: 'whatsapp', created_at: new Date(Date.now() - 345600000).toISOString(), vehicle_id: 'v5', utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'Ads_Retargeting_BH', vehicles: { brand: 'BMW', model: '320i M Sport', year: 2022, sellerName: 'Ana Souza Veículos' } },
        { id: '6', name: 'Patrícia Lima', phone: '(71) 94321-0987', email: null, source: 'form', created_at: new Date(Date.now() - 432000000).toISOString(), vehicle_id: 'v6', utm_source: null, utm_medium: null, utm_campaign: null, vehicles: { brand: 'Hyundai', model: 'Creta Platinum', year: 2024, sellerName: 'Carlos Silva Motors' } },
      ]);
      setIsLoading(false);
    }, 800);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const sourceLabels: Record<string, string> = { whatsapp: 'WhatsApp', phone: 'Telefone', form: 'Formulário' };

  const filteredLeads = leads.filter(lead => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesName = lead.name.toLowerCase().includes(search);
      const matchesPhone = lead.phone.includes(search);
      const matchesVehicle = lead.vehicles ? `${lead.vehicles.brand} ${lead.vehicles.model}`.toLowerCase().includes(search) : false;
      if (!matchesName && !matchesPhone && !matchesVehicle) return false;
    }
    if (filterSource !== ALL_VALUE && lead.source !== filterSource) return false;
    if (filterPeriod !== ALL_VALUE) {
      const leadDate = new Date(lead.created_at);
      const now = new Date();
      switch (filterPeriod) {
        case 'today': if (leadDate.toDateString() !== now.toDateString()) return false; break;
        case 'week': if (leadDate < new Date(now.getTime() - 7 * 86400000)) return false; break;
        case 'month': if (leadDate < new Date(now.getTime() - 30 * 86400000)) return false; break;
      }
    }
    return true;
  });

  const clearFilters = () => { setSearchTerm(''); setFilterSource(ALL_VALUE); setFilterPeriod(ALL_VALUE); };
  const hasFilters = searchTerm || filterSource !== ALL_VALUE || filterPeriod !== ALL_VALUE;

  if (isLoading) {
    return (<div className="container py-8"><div className="animate-pulse space-y-4">{[1, 2, 3].map((i) => (<div key={i} className="h-24 bg-muted rounded-xl" />))}</div></div>);
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold">Leads</h1>
            <Badge variant="secondary">{filteredLeads.length} de {leads.length}</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={() => toast.success('Exportado!', { description: `${filteredLeads.length} leads exportados.` })}>
            <Download className="h-4 w-4 mr-2" /> Exportar CSV
          </Button>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome, telefone ou veículo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Select value={filterSource} onValueChange={setFilterSource}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Origem" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Todas origens</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="phone">Telefone</SelectItem>
              <SelectItem value="form">Formulário</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPeriod} onValueChange={setFilterPeriod}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Período" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Todo período</SelectItem>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mês</SelectItem>
            </SelectContent>
          </Select>
          {hasFilters && (<Button variant="ghost" size="icon" onClick={clearFilters}><X className="h-4 w-4" /></Button>)}
        </div>

        {filteredLeads.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full gradient-kairos-soft flex items-center justify-center">
              <MessageSquare className="h-10 w-10 text-primary" />
            </div>
            <h2 className="font-heading text-xl font-bold mb-2">Nenhum lead ainda</h2>
            <p className="text-muted-foreground">Os leads aparecerão aqui quando clientes entrarem em contato.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLeads.map((lead) => (
              <div key={lead.id} className="bg-card rounded-2xl p-4 shadow-card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-semibold">{lead.name}</h3>
                      <Badge variant="outline">{sourceLabels[lead.source] || lead.source}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Phone className="h-4 w-4" />{lead.phone}</span>
                      {lead.email && (<span className="flex items-center gap-1"><Mail className="h-4 w-4" />{lead.email}</span>)}
                      <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{formatDate(lead.created_at)}</span>
                    </div>
                    {lead.vehicles && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Veículo: </span>
                        <span className="font-medium">{lead.vehicles.brand} {lead.vehicles.model} {lead.vehicles.year}</span>
                        {lead.vehicles.sellerName && (<span className="text-muted-foreground"> (vendedor: {lead.vehicles.sellerName})</span>)}
                      </p>
                    )}
                    {(lead.utm_source || lead.utm_campaign || lead.utm_medium) && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {lead.utm_source && (<Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border-blue-200">source: {lead.utm_source}</Badge>)}
                        {lead.utm_medium && (<Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-200">medium: {lead.utm_medium}</Badge>)}
                        {lead.utm_campaign && (<Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-600 border-purple-200">campaign: {lead.utm_campaign}</Badge>)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-sm hover:bg-[#20BD5A] transition-colors">
                      <MessageSquare className="h-4 w-4" /> WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
