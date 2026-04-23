"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Eye, Clock, CheckCircle, XCircle, FileText, Car, BadgeCheck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { fetchApi } from '@/lib/api';

interface VehicleWithMedia {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  status: string;
  slug: string;
  created_at: string;
  vehicle_media: { url: string }[];
}

const statusConfig = {
  draft: { label: 'Rascunho', icon: FileText, variant: 'secondary' as const, color: 'text-muted-foreground' },
  pending: { label: 'Em análise', icon: Clock, variant: 'outline' as const, color: 'text-amber-600' },
  approved: { label: 'Publicado', icon: CheckCircle, variant: 'default' as const, color: 'text-green-600' },
  rejected: { label: 'Rejeitado', icon: XCircle, variant: 'destructive' as const, color: 'text-destructive' },
  sold: { label: 'Vendido', icon: BadgeCheck, variant: 'secondary' as const, color: 'text-primary' },
};

export function MyVehiclesClient() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<VehicleWithMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (user) {
      fetchVehicles();
    }
  }, [user]);

  const fetchVehicles = async () => {
    try {
      const data = await fetchApi<any[]>('/vehicles/mine', { requireAuth: true });
      
      const mappedVehicles = data.map(v => ({
        ...v,
        vehicle_media: v.media || []
      }));
      
      setVehicles(mappedVehicles);

    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
    setIsLoading(false);
  };

  const handleDelete = async (vehicleId: string) => {
    try {
      await fetchApi(`/vehicles/${vehicleId}`, {
        method: 'DELETE',
        requireAuth: true
      });
      
      toast({
        title: "Anúncio excluído",
        description: "O anúncio foi removido com sucesso.",
      });
      fetchVehicles();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleMarkAsSold = async (vehicleId: string) => {
    try {
      await fetchApi(`/vehicles/${vehicleId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'sold' }),
        requireAuth: true
      });

      toast({
        title: "Parabéns pela venda! 🎉",
        description: "Seu anúncio foi marcado como vendido.",
      });
      fetchVehicles();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return vehicle.status === 'approved';
    if (activeTab === 'pending') return vehicle.status === 'pending' || vehicle.status === 'draft';
    if (activeTab === 'sold') return vehicle.status === 'sold';
    return true;
  });

  const stats = {
    total: vehicles.length,
    active: vehicles.filter(v => v.status === 'approved').length,
    pending: vehicles.filter(v => v.status === 'pending' || v.status === 'draft').length,
    sold: vehicles.filter(v => v.status === 'sold').length,
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild title="Voltar ao início">
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="font-heading text-2xl font-bold">Meus Anúncios</h1>
          </div>
          <Button variant="kairos" asChild>
            <Link href="/anunciar">
              <Plus className="h-4 w-4 mr-2" />
              Novo anúncio
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-xl p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg gradient-brand-soft">
                <Car className="h-5 w-5 text-primary" />
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
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg gradient-brand-soft">
                <BadgeCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.sold}</p>
                <p className="text-xs text-muted-foreground">Vendidos</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="active">Ativos</TabsTrigger>
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="sold">Vendidos</TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredVehicles.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full gradient-brand-soft flex items-center justify-center">
              <span className="text-4xl">🚗</span>
            </div>
            <h2 className="font-heading text-xl font-bold mb-2">
              {activeTab === 'all' ? 'Nenhum anúncio ainda' : 'Nenhum anúncio nesta categoria'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {activeTab === 'all' ? 'Comece a vender seus veículos agora mesmo!' : 'Seus anúncios aparecerão aqui.'}
            </p>
            {activeTab === 'all' && (
              <Button variant="kairos" asChild>
                <Link href="/anunciar">Criar primeiro anúncio</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVehicles.map((vehicle) => {
              const status = statusConfig[vehicle.status as keyof typeof statusConfig] || statusConfig.draft;
              const StatusIcon = status.icon;
              const thumbnail = vehicle.vehicle_media?.[0]?.url || '/placeholder.svg';
              return (
                <div
                  key={vehicle.id}
                  className="bg-card rounded-2xl shadow-card overflow-hidden flex"
                >
                  <div className="w-32 h-28 sm:w-40 sm:h-32 shrink-0">
                    <img
                      src={thumbnail}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-heading font-semibold">
                          {vehicle.brand} {vehicle.model}
                        </h3>
                        <Badge variant={status.variant} className="text-xs">
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{vehicle.year}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="font-semibold gradient-brand-text">{formatPrice(vehicle.price)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {vehicle.status === 'approved' && (
                        <>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/veiculo/${vehicle.slug}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-primary">
                                <BadgeCheck className="h-4 w-4 mr-1" />
                                Vendi!
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Marcar como vendido?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Parabéns pela venda! O anúncio será removido das listagens públicas.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleMarkAsSold(vehicle.id)}
                                  className="bg-primary text-primary-foreground"
                                >
                                  Confirmar venda
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                      {vehicle.status !== 'sold' && (
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/meus-anuncios/${vehicle.id}/editar`}>
                            <Edit2 className="h-4 w-4 mr-1" />
                            Editar
                          </Link>
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir anúncio?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. O anúncio será removido permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(vehicle.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
