"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Store, Search, BadgeCheck, Star, MapPin, Phone, Car, ExternalLink, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface Dealer {
  id: string; dealer_name: string; dealer_slug: string; dealer_logo: string | null;
  city: string | null; state: string | null; phone: string | null;
  dealer_verified: boolean; dealer_featured: boolean; vehicle_count: number;
}

const mockDealers: Dealer[] = [];

export default function AdminDealersPage() {
  const [search, setSearch] = useState('');
  const [dealers, setDealers] = useState<Dealer[]>(mockDealers);

  const filteredDealers = dealers.filter(d =>
    d.dealer_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.city?.toLowerCase().includes(search.toLowerCase()) ||
    d.state?.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleVerified = (id: string) => {
    setDealers(prev => prev.map(d => d.id === id ? { ...d, dealer_verified: !d.dealer_verified } : d));
    const dealer = dealers.find(d => d.id === id);
    toast.success(dealer?.dealer_verified ? 'Verificação removida' : 'Lojista verificado');
  };

  const handleToggleFeatured = (id: string) => {
    setDealers(prev => prev.map(d => d.id === id ? { ...d, dealer_featured: !d.dealer_featured } : d));
    const dealer = dealers.find(d => d.id === id);
    toast.success(dealer?.dealer_featured ? 'Destaque removido' : 'Lojista em destaque');
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="container py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button variant="ghost" size="icon" asChild><Link href="/admin"><ArrowLeft className="h-5 w-5" /></Link></Button>
              <div className="p-2 rounded-lg bg-[#268052]"><Store className="h-6 w-6 text-white" /></div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold">Gerenciar Lojistas</h1>
            </div>
            <p className="text-muted-foreground">Verifique e destaque lojistas parceiros</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome, cidade ou estado..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-xl p-4 shadow-card"><Store className="h-5 w-5 text-primary mb-2" /><p className="text-2xl font-bold">{dealers.length}</p><p className="text-xs text-muted-foreground">Total de Lojistas</p></div>
          <div className="bg-card rounded-xl p-4 shadow-card"><BadgeCheck className="h-5 w-5 text-green-500 mb-2" /><p className="text-2xl font-bold">{dealers.filter(d => d.dealer_verified).length}</p><p className="text-xs text-muted-foreground">Verificados</p></div>
          <div className="bg-card rounded-xl p-4 shadow-card"><Star className="h-5 w-5 text-yellow-500 mb-2" /><p className="text-2xl font-bold">{dealers.filter(d => d.dealer_featured).length}</p><p className="text-xs text-muted-foreground">Em Destaque</p></div>
          <div className="bg-card rounded-xl p-4 shadow-card"><Car className="h-5 w-5 text-blue-500 mb-2" /><p className="text-2xl font-bold">{dealers.reduce((acc, d) => acc + d.vehicle_count, 0)}</p><p className="text-xs text-muted-foreground">Total de Veículos</p></div>
        </div>

        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lojista</TableHead>
                <TableHead className="hidden md:table-cell">Localização</TableHead>
                <TableHead className="hidden md:table-cell">Contato</TableHead>
                <TableHead className="text-center">Veículos</TableHead>
                <TableHead className="text-center">Verificado</TableHead>
                <TableHead className="text-center">Destaque</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDealers.length > 0 ? filteredDealers.map((dealer) => (
                <TableRow key={dealer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#268052] flex items-center justify-center text-white font-bold">{dealer.dealer_name?.charAt(0)}</div>
                      <div><p className="font-medium line-clamp-1">{dealer.dealer_name}</p><p className="text-xs text-muted-foreground">{dealer.dealer_slug}</p></div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {dealer.city && dealer.state ? (<span className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3 w-3" />{dealer.city}, {dealer.state}</span>) : <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {dealer.phone ? (<span className="flex items-center gap-1 text-sm text-muted-foreground"><Phone className="h-3 w-3" />{dealer.phone}</span>) : <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell className="text-center"><Badge variant="secondary">{dealer.vehicle_count}</Badge></TableCell>
                  <TableCell className="text-center"><Switch checked={dealer.dealer_verified} onCheckedChange={() => handleToggleVerified(dealer.id)} /></TableCell>
                  <TableCell className="text-center"><Switch checked={dealer.dealer_featured} onCheckedChange={() => handleToggleFeatured(dealer.id)} /></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild><Link href={`/loja/${dealer.dealer_slug}`} target="_blank"><ExternalLink className="h-4 w-4" /></Link></Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={7} className="text-center py-12"><Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">{search ? 'Nenhum lojista encontrado' : 'Nenhum lojista cadastrado'}</p></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
