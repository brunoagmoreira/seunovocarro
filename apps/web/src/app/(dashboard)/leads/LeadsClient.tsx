"use client";

import { useState, useEffect } from 'react';
import { MessageSquare, Phone, Calendar, Car, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
// TODO: Replace with Next.js API abstraction in backend migration phase
import { supabase } from '@/integrations/supabase/client';

interface LeadWithVehicle {
  id: string;
  name: string;
  phone: string;
  source: string;
  created_at: string;
  vehicle: {
    id: string;
    brand: string;
    model: string;
    year: number;
  } | null;
}

export function LeadsClient() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<LeadWithVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
  });

  useEffect(() => {
    if (user) {
      fetchLeads();
    }
  }, [user]);

  const fetchLeads = async () => {
    // First get user's vehicles
    const { data: userVehicles } = await supabase
      .from('vehicles')
      .select('id, brand, model, year')
      .eq('user_id', user?.id);

    if (!userVehicles?.length) {
      setIsLoading(false);
      return;
    }

    const vehicleIds = userVehicles.map(v => v.id);

    // Then get leads for those vehicles
    const { data: leadsData, error } = await (supabase as any)
      .from('leads')
      .select('id, name, phone, source, created_at, vehicle_id')
      .in('vehicle_id', vehicleIds)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leads:', error);
      setIsLoading(false);
      return;
    }

    // Map leads with vehicle info
    const leadsWithVehicles = (leadsData as any[])?.map((lead: any) => ({
      ...lead,
      vehicle: userVehicles.find(v => v.id === lead.vehicle_id) || null
    })) || [];

    setLeads(leadsWithVehicles);

    // Calculate stats
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    setStats({
      total: leadsWithVehicles.length,
      today: leadsWithVehicles.filter(l => new Date(l.created_at) >= todayStart).length,
      thisWeek: leadsWithVehicles.filter(l => new Date(l.created_at) >= weekStart).length,
      thisMonth: leadsWithVehicles.filter(l => new Date(l.created_at) >= monthStart).length,
    });

    setIsLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays} dias atrás`;
    return formatDate(dateString);
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

  return (
    <div className="min-h-screen pb-24 md:pb-8 pt-16">
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading text-2xl font-bold">Meus Leads</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-xl p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg gradient-kairos-soft">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.today}</p>
                <p className="text-xs text-muted-foreground">Hoje</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.thisWeek}</p>
                <p className="text-xs text-muted-foreground">Esta semana</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.thisMonth}</p>
                <p className="text-xs text-muted-foreground">Este mês</p>
              </div>
            </div>
          </div>
        </div>

        {leads.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full gradient-kairos-soft flex items-center justify-center">
              <MessageSquare className="h-10 w-10 text-primary" />
            </div>
            <h2 className="font-heading text-xl font-bold mb-2">Nenhum lead ainda</h2>
            <p className="text-muted-foreground">
              Os leads aparecerão aqui quando clientes entrarem em contato pelos seus anúncios.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="bg-card rounded-2xl p-4 shadow-card"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-semibold">{lead.name}</h3>
                      <Badge variant="outline">
                        {lead.source === 'whatsapp' ? 'WhatsApp' : lead.source}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {getRelativeTime(lead.created_at)}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {lead.phone}
                      </span>
                    </div>

                    {lead.vehicle && (
                      <p className="text-sm flex items-center gap-1">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {lead.vehicle.brand} {lead.vehicle.model} {lead.vehicle.year}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-[#25D366] text-white text-sm font-medium hover:bg-[#20BD5A] transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Responder
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
