"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, X, Eye, Clock, CheckCircle, XCircle, FileText, Search, Download, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface VehicleWithDetails {
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
  thumbnail: string;
  sellerName: string | null;
}

const statusConfig: Record<string, { label: string; icon: any; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  draft: { label: 'Rascunho', icon: FileText, variant: 'secondary' },
  pending: { label: 'Em análise', icon: Clock, variant: 'outline' },
  approved: { label: 'Publicado', icon: CheckCircle, variant: 'default' },
  rejected: { label: 'Rejeitado', icon: XCircle, variant: 'destructive' },
};

const ALL_VALUE = '__all__';

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState<string>(ALL_VALUE);

  useEffect(() => {
    setTimeout(() => {
      setVehicles([
        { id: '1', brand: 'Honda', model: 'Civic Touring', year: 2023, price: 189900, status: 'approved', slug: 'honda-civic-touring-2023', created_at: new Date().toISOString(), city: 'Belo Horizonte', state: 'MG', display_id: 'SNC-001', thumbnail: '/placeholder.svg', sellerName: 'Carlos Silva Motors' },
        { id: '2', brand: 'Toyota', model: 'Corolla Altis', year: 2024, price: 175000, status: 'pending', slug: 'toyota-corolla-altis-2024', created_at: new Date().toISOString(), city: 'São Paulo', state: 'SP', display_id: 'SNC-002', thumbnail: '/placeholder.svg', sellerName: 'Ana Souza Veículos' },
        { id: '3', brand: 'Volkswagen', model: 'Polo Highline', year: 2024, price: 98500, status: 'pending', slug: 'vw-polo-highline-2024', created_at: new Date().toISOString(), city: 'Curitiba', state: 'PR', display_id: 'SNC-003', thumbnail: '/placeholder.svg', sellerName: 'Marina Premium Cars' },
        { id: '4', brand: 'Jeep', model: 'Compass Limited', year: 2023, price: 165000, status: 'approved', slug: 'jeep-compass-limited-2023', created_at: new Date().toISOString(), city: 'Rio de Janeiro', state: 'RJ', display_id: 'SNC-004', thumbnail: '/placeholder.svg', sellerName: 'Carlos Silva Motors' },
        { id: '5', brand: 'BMW', model: '320i M Sport', year: 2022, price: 285000, status: 'rejected', slug: 'bmw-320i-msport-2022', created_at: new Date().toISOString(), city: 'Brasília', state: 'DF', display_id: 'SNC-005', thumbnail: '/placeholder.svg', sellerName: 'Pedro Autos' },
        { id: '6', brand: 'Hyundai', model: 'Creta Platinum', year: 2024, price: 142000, status: 'draft', slug: 'hyundai-creta-platinum-2024', created_at: new Date().toISOString(), city: 'Salvador', state: 'BA', display_id: 'SNC-006', thumbnail: '/placeholder.svg', sellerName: 'Ana Souza Veículos' },
        { id: '7', brand: 'Chevrolet', model: 'Tracker Premier', year: 2024, price: 135900, status: 'approved', slug: 'chevrolet-tracker-premier-2024', created_at: new Date().toISOString(), city: 'Porto Alegre', state: 'RS', display_id: 'SNC-007', thumbnail: '/placeholder.svg', sellerName: 'Marina Premium Cars' },
        { id: '8', brand: 'Mercedes-Benz', model: 'C200 Avantgarde', year: 2023, price: 320000, status: 'pending', slug: 'mercedes-c200-2023', created_at: new Date().toISOString(), city: 'São Paulo', state: 'SP', display_id: 'SNC-008', thumbnail: '/placeholder.svg', sellerName: 'Carlos Silva Motors' },
      ]);
      setIsLoading(false);
    }, 800);
  }, []);

  const updateVehicleStatus = (vehicleId: string, newStatus: 'approved' | 'rejected') => {
    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, status: newStatus } : v));
    toast.success(newStatus === 'approved' ? 'Anúncio aprovado!' : 'Anúncio rejeitado', {
      description: newStatus === 'approved' ? 'O anúncio agora está público.' : 'O anúncio foi rejeitado.',
    });
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(price);

  const uniqueBrands = [...new Set(vehicles.map(v => v.brand))].sort();

  const filteredVehicles = vehicles.filter(vehicle => {
    if (filterStatus !== 'all' && vehicle.status !== filterStatus) return false;
    if (filterBrand !== ALL_VALUE && vehicle.brand !== filterBrand) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      if (!vehicle.brand.toLowerCase().includes(search) && !vehicle.model.toLowerCase().includes(search) && !vehicle.sellerName?.toLowerCase().includes(search) && !vehicle.city?.toLowerCase().includes(search) && !vehicle.display_id?.toLowerCase().includes(search)) return false;
    }
    return true;
  });

  if (isLoading) {
    return (<div className="container py-8"><div className="animate-pulse space-y-4">{[1, 2, 3].map((i) => (<div key={i} className="h-24 bg-muted rounded-xl" />))}</div></div>);
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="container py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold">Gerenciar Veículos</h1>
            <Badge variant="secondary">{filteredVehicles.length} de {vehicles.length}</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={() => toast.success('Exportado!', { description: `${filteredVehicles.length} veículos exportados.` })}>
            <Download className="h-4 w-4 mr-2" /> Exportar
          </Button>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por ID, marca, modelo, vendedor..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="approved">Aprovados</SelectItem>
              <SelectItem value="rejected">Rejeitados</SelectItem>
              <SelectItem value="draft">Rascunhos</SelectItem>
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

        {filteredVehicles.length === 0 ? (
          <div className="text-center py-16"><p className="text-muted-foreground">Nenhum veículo encontrado</p></div>
        ) : (
          <div className="space-y-4">
            {filteredVehicles.map((vehicle) => {
              const status = statusConfig[vehicle.status] || statusConfig.draft;
              const StatusIcon = status.icon;
              return (
                <div key={vehicle.id} className="bg-card rounded-2xl shadow-card overflow-hidden">
                  <div className="flex">
                    <div className="w-32 h-28 sm:w-40 sm:h-32 shrink-0 bg-muted flex items-center justify-center">
                      <BarChart3 className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                    <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {vehicle.display_id && (
                            <Badge variant="secondary" className="text-xs font-mono bg-primary/10 text-primary">{vehicle.display_id}</Badge>
                          )}
                          <h3 className="font-heading font-semibold">{vehicle.brand} {vehicle.model} {vehicle.year}</h3>
                          <Badge variant={status.variant} className="text-xs">
                            <StatusIcon className="h-3 w-3 mr-1" />{status.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Por: {vehicle.sellerName || 'Desconhecido'} • {vehicle.city}, {vehicle.state}</p>
                        <p className="font-semibold text-[#268052]">{formatPrice(vehicle.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/veiculo/${vehicle.slug}?preview=true`} target="_blank"><Eye className="h-4 w-4" /></Link>
                        </Button>
                        {vehicle.status === 'pending' && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => updateVehicleStatus(vehicle.id, 'approved')} className="text-green-600 hover:text-green-700">
                              <Check className="h-4 w-4 mr-1" /> Aprovar
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => updateVehicleStatus(vehicle.id, 'rejected')} className="text-destructive hover:text-destructive">
                              <X className="h-4 w-4 mr-1" /> Rejeitar
                            </Button>
                          </>
                        )}
                        {vehicle.status === 'rejected' && (
                          <Button variant="ghost" size="sm" onClick={() => updateVehicleStatus(vehicle.id, 'approved')}>Aprovar</Button>
                        )}
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
