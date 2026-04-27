"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, X, Eye, Clock, CheckCircle, XCircle, FileText, Search, Download, BarChart3, ArrowLeft, Loader2, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { fetchApi } from '@/lib/api';
import { downloadCsv, csvFilename } from '@/lib/csvExport';
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

interface VehicleMedia {
  id: string;
  url: string;
  type: string;
  order: number;
}

interface VehicleFromAPI {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  status: string;
  slug: string;
  created_at: string;
  city: string;
  state: string;
  display_id: string | null;
  user_id: string;
  featured?: boolean;
  media: VehicleMedia[];
  seller?: {
    id: string;
    full_name: string | null;
    email?: string | null;
    city: string | null;
    state: string | null;
    dealer?: {
      name?: string | null;
    } | null;
  } | null;
}

const statusConfig: Record<string, { label: string; icon: any; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  draft: { label: 'Rascunho', icon: FileText, variant: 'secondary' },
  pending: { label: 'Em análise', icon: Clock, variant: 'outline' },
  approved: { label: 'Publicado', icon: CheckCircle, variant: 'default' },
  sold: { label: 'Vendido', icon: CheckCircle, variant: 'secondary' },
  expired: { label: 'Expirado', icon: XCircle, variant: 'destructive' },
};

const ALL_VALUE = '__all__';

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleFromAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState<string>(ALL_VALUE);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [featuredUpdatingId, setFeaturedUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkApproving, setIsBulkApproving] = useState(false);

  const loadVehicles = async () => {
    try {
      const data = await fetchApi<VehicleFromAPI[]>('/vehicles/admin/all', { requireAuth: true });
      setVehicles(data);
    } catch (error: any) {
      console.error('Erro ao carregar veículos:', error);
      toast.error('Erro ao carregar veículos', { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadVehicles(); }, []);

  const getSellerDisplayName = (vehicle: VehicleFromAPI) => {
    const fullName = vehicle.seller?.full_name?.trim();
    if (fullName) return fullName;
    const dealerName = vehicle.seller?.dealer?.name?.trim();
    if (dealerName) return dealerName;
    const email = vehicle.seller?.email?.trim();
    if (email) return email;
    return 'Vendedor não informado';
  };

  const updateVehicleStatus = async (vehicleId: string, newStatus: 'approved' | 'pending' | 'draft') => {
    setUpdatingId(vehicleId);
    try {
      await fetchApi(`/vehicles/admin/${vehicleId}/status`, {
        method: 'PATCH',
        body: { status: newStatus },
        requireAuth: true,
      });
      setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, status: newStatus } : v));
      toast.success(newStatus === 'approved' ? 'Anúncio aprovado!' : 'Status atualizado', {
        description: newStatus === 'approved' ? 'O anúncio agora está público.' : `Status alterado para ${statusConfig[newStatus]?.label || newStatus}.`,
      });
    } catch (error: any) {
      toast.error('Erro ao atualizar status', { description: error.message });
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteVehicle = async (vehicleId: string) => {
    setDeletingId(vehicleId);
    try {
      await fetchApi(`/vehicles/admin/${vehicleId}`, {
        method: 'DELETE',
        requireAuth: true,
      });
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
      toast.success('Veículo excluído', {
        description: 'O anúncio e as mídias vinculadas foram removidos do sistema.',
      });
    } catch (error: any) {
      toast.error('Erro ao excluir', { description: error.message });
    } finally {
      setDeletingId(null);
    }
  };

  const setVehicleFeatured = async (vehicleId: string, featured: boolean) => {
    setFeaturedUpdatingId(vehicleId);
    try {
      await fetchApi(`/vehicles/admin/${vehicleId}/featured`, {
        method: 'PATCH',
        body: { featured },
        requireAuth: true,
      });
      setVehicles((prev) =>
        prev.map((v) => (v.id === vehicleId ? { ...v, featured } : v)),
      );
      toast.success(featured ? 'Veículo em destaque na home' : 'Destaque removido', {
        description: featured
          ? 'Ele aparece prioritariamente na vitrine (até o limite de slots).'
          : 'A ordem da vitrine volta a seguir apenas a data de publicação.',
      });
    } catch (error: any) {
      toast.error('Não foi possível atualizar o destaque', { description: error.message });
    } finally {
      setFeaturedUpdatingId(null);
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(price);

  const uniqueBrands = [...new Set(vehicles.map(v => v.brand))].sort();

  const filteredVehicles = vehicles.filter(vehicle => {
    if (filterStatus !== 'all' && vehicle.status !== filterStatus) return false;
    if (filterBrand !== ALL_VALUE && vehicle.brand !== filterBrand) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const sellerName = vehicle.seller?.full_name || '';
      if (!vehicle.brand.toLowerCase().includes(search) && !vehicle.model.toLowerCase().includes(search) && !sellerName.toLowerCase().includes(search) && !vehicle.city?.toLowerCase().includes(search) && !vehicle.display_id?.toLowerCase().includes(search)) return false;
    }
    return true;
  });

  const pendingCount = vehicles.filter(v => v.status === 'pending').length;
  const pendingFilteredVehicles = filteredVehicles.filter((v) => v.status === 'pending');
  const selectablePendingIds = pendingFilteredVehicles.map((v) => v.id);
  const selectedPendingIds = selectedIds.filter((id) => selectablePendingIds.includes(id));
  const allPendingSelected = selectablePendingIds.length > 0 && selectedPendingIds.length === selectablePendingIds.length;

  const handleExportCsv = () => {
    if (filteredVehicles.length === 0) {
      toast.warning('Nada para exportar', { description: 'Ajuste os filtros ou aguarde novos veículos.' });
      return;
    }
    const headers = [
      'id',
      'codigo_exibicao',
      'marca',
      'modelo',
      'ano',
      'status',
      'preco',
      'cidade',
      'uf',
      'vendedor',
      'cidade_vendedor',
      'uf_vendedor',
      'slug',
      'destaque',
      'url_imagem',
      'criado_em',
    ];
    const rows = filteredVehicles.map((v) => [
      v.id,
      v.display_id ?? '',
      v.brand,
      v.model,
      v.year,
      v.status,
      v.price,
      v.city,
      v.state,
      v.seller?.full_name ?? '',
      v.seller?.city ?? '',
      v.seller?.state ?? '',
      v.slug,
      v.featured ? 'sim' : 'nao',
      v.media?.[0]?.url ?? '',
      v.created_at,
    ]);
    downloadCsv(csvFilename('veiculos-admin'), headers, rows);
    toast.success('Arquivo gerado', {
      description: `${filteredVehicles.length} veículo(s) no CSV (separador ;, UTF-8).`,
    });
  };

  const toggleSelectVehicle = (vehicleId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) return prev.includes(vehicleId) ? prev : [...prev, vehicleId];
      return prev.filter((id) => id !== vehicleId);
    });
  };

  const toggleSelectAllPending = (checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...selectablePendingIds])));
      return;
    }
    setSelectedIds((prev) => prev.filter((id) => !selectablePendingIds.includes(id)));
  };

  const handleBulkApprove = async () => {
    if (selectedPendingIds.length === 0) {
      toast.warning('Selecione ao menos 1 anúncio pendente');
      return;
    }
    setIsBulkApproving(true);
    try {
      await Promise.all(
        selectedPendingIds.map((vehicleId) =>
          fetchApi(`/vehicles/admin/${vehicleId}/status`, {
            method: 'PATCH',
            body: { status: 'approved' },
            requireAuth: true,
          }),
        ),
      );
      setVehicles((prev) =>
        prev.map((vehicle) =>
          selectedPendingIds.includes(vehicle.id) ? { ...vehicle, status: 'approved' } : vehicle,
        ),
      );
      setSelectedIds((prev) => prev.filter((id) => !selectedPendingIds.includes(id)));
      toast.success('Anúncios aprovados', {
        description: `${selectedPendingIds.length} anúncio(s) aprovado(s) com sucesso.`,
      });
    } catch (error: any) {
      toast.error('Erro ao aprovar em lote', { description: error.message });
    } finally {
      setIsBulkApproving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-24 gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Carregando veículos do banco...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="container py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild><Link href="/admin"><ArrowLeft className="h-5 w-5" /></Link></Button>
            <h1 className="font-heading text-2xl font-bold">Gerenciar Veículos</h1>
            <Badge variant="secondary">{filteredVehicles.length} de {vehicles.length}</Badge>
            {pendingCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">{pendingCount} pendente{pendingCount > 1 ? 's' : ''}</Badge>
            )}
          </div>
          <Button variant="outline" size="sm" type="button" onClick={handleExportCsv}>
            <Download className="h-4 w-4 mr-2" /> Exportar CSV
          </Button>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por marca, modelo, vendedor, cidade..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="approved">Aprovados</SelectItem>
              <SelectItem value="draft">Rascunhos</SelectItem>
              <SelectItem value="sold">Vendidos</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterBrand} onValueChange={setFilterBrand}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Marca" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Todas marcas</SelectItem>
              {uniqueBrands.map(brand => (<SelectItem key={brand} value={brand}>{brand}</SelectItem>))}
            </SelectContent>
          </Select>
          {(searchTerm || filterStatus !== 'all' || filterBrand !== ALL_VALUE) && (
            <Button variant="ghost" size="icon" onClick={() => { setSearchTerm(''); setFilterStatus('all'); setFilterBrand(ALL_VALUE); }}><X className="h-4 w-4" /></Button>
          )}
        </div>

        {pendingFilteredVehicles.length > 0 && (
          <div className="mb-4 p-3 rounded-xl border bg-muted/20 flex flex-wrap items-center gap-3 justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={allPendingSelected}
                  onCheckedChange={(checked) => toggleSelectAllPending(Boolean(checked))}
                  aria-label="Selecionar todos os pendentes filtrados"
                />
                <span className="text-sm text-muted-foreground">
                  Selecionar todos os pendentes ({pendingFilteredVehicles.length})
                </span>
              </div>
              {selectedPendingIds.length > 0 && (
                <Badge variant="secondary">{selectedPendingIds.length} selecionado(s)</Badge>
              )}
            </div>
            <Button
              size="sm"
              onClick={handleBulkApprove}
              disabled={isBulkApproving || selectedPendingIds.length === 0}
              className="min-w-[170px]"
            >
              {isBulkApproving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Aprovando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Aprovar selecionados
                </>
              )}
            </Button>
          </div>
        )}

        {filteredVehicles.length === 0 ? (
          <div className="text-center py-16"><p className="text-muted-foreground">Nenhum veículo encontrado</p></div>
        ) : (
          <div className="space-y-4">
            {filteredVehicles.map((vehicle) => {
              const status = statusConfig[vehicle.status] || statusConfig.draft;
              const StatusIcon = status.icon;
              const thumbnail = vehicle.media?.[0]?.url;
              const isUpdating = updatingId === vehicle.id;
              const isDeleting = deletingId === vehicle.id;
              return (
                <div key={vehicle.id} className={`bg-card rounded-2xl shadow-card overflow-hidden ${vehicle.status === 'pending' ? 'ring-2 ring-amber-400/50' : ''}`}>
                  <div className="flex">
                    <div className="w-32 h-28 sm:w-40 sm:h-32 shrink-0 bg-muted flex items-center justify-center overflow-hidden">
                      {thumbnail ? (
                        <img src={thumbnail} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover" />
                      ) : (
                        <BarChart3 className="h-8 w-8 text-muted-foreground/30" />
                      )}
                    </div>
                    <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {vehicle.status === 'pending' && (
                            <Checkbox
                              checked={selectedIds.includes(vehicle.id)}
                              onCheckedChange={(checked) => toggleSelectVehicle(vehicle.id, Boolean(checked))}
                              aria-label={`Selecionar ${vehicle.brand} ${vehicle.model}`}
                            />
                          )}
                          {vehicle.display_id && (
                            <Badge variant="secondary" className="text-xs font-mono bg-primary/10 text-primary">{vehicle.display_id}</Badge>
                          )}
                          <h3 className="font-heading font-semibold">{vehicle.brand} {vehicle.model} {vehicle.year}</h3>
                          <Badge variant={status.variant} className="text-xs">
                            <StatusIcon className="h-3 w-3 mr-1" />{status.label}
                          </Badge>
                          {vehicle.featured && vehicle.status === 'approved' && (
                            <Badge variant="outline" className="text-xs border-amber-400/60 text-amber-800 bg-amber-50">
                              <Star className="h-3 w-3 mr-1 fill-amber-400 text-amber-500" />
                              Destaque
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Por: {getSellerDisplayName(vehicle)} • {vehicle.seller?.city || vehicle.city}, {vehicle.seller?.state || vehicle.state}
                        </p>
                        <p className="font-semibold text-[#268052]">{formatPrice(vehicle.price)}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        <div
                          className="flex items-center gap-2 rounded-lg border border-border px-2 py-1.5 bg-muted/30"
                          title={
                            vehicle.status !== 'approved'
                              ? 'Apenas anúncios publicados podem ir em destaque na home.'
                              : 'Prioriza este veículo na vitrine da página inicial.'
                          }
                        >
                          <Star
                            className={`h-4 w-4 shrink-0 ${vehicle.featured ? 'fill-amber-400 text-amber-500' : 'text-muted-foreground'}`}
                          />
                          <span className="text-xs text-muted-foreground hidden sm:inline">Destaque</span>
                          <Switch
                            checked={Boolean(vehicle.featured)}
                            disabled={
                              featuredUpdatingId === vehicle.id ||
                              vehicle.status !== 'approved'
                            }
                            onCheckedChange={(on) => setVehicleFeatured(vehicle.id, on)}
                          />
                        </div>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/veiculo/${vehicle.slug}?preview=true`} target="_blank"><Eye className="h-4 w-4" /></Link>
                        </Button>
                        {vehicle.status === 'pending' && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => updateVehicleStatus(vehicle.id, 'approved')} className="text-green-600 hover:text-green-700" disabled={isUpdating}>
                              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-1" /> Aprovar</>}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => updateVehicleStatus(vehicle.id, 'draft')} className="text-destructive hover:text-destructive" disabled={isUpdating}>
                              <X className="h-4 w-4 mr-1" /> Rejeitar
                            </Button>
                          </>
                        )}
                        {vehicle.status === 'draft' && (
                          <Button variant="ghost" size="sm" onClick={() => updateVehicleStatus(vehicle.id, 'approved')} disabled={isUpdating}>Aprovar</Button>
                        )}
                        {vehicle.status === 'approved' && (
                          <Button variant="ghost" size="sm" onClick={() => updateVehicleStatus(vehicle.id, 'pending')} disabled={isUpdating} className="text-amber-600">Pausar</Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              disabled={isDeleting || isUpdating}
                              title="Excluir anúncio permanentemente"
                            >
                              {isDeleting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir este veículo?</AlertDialogTitle>
                              <AlertDialogDescription>
                                {vehicle.brand} {vehicle.model} {vehicle.year} — esta ação não pode ser desfeita.
                                Leads e dados ligados a este anúncio podem ser afetados conforme as regras do banco.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => deleteVehicle(vehicle.id)}
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
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
