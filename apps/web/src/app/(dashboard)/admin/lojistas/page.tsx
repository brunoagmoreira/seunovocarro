"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Store,
  Search,
  BadgeCheck,
  Star,
  MapPin,
  Phone,
  Car,
  ExternalLink,
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { fetchApi } from '@/lib/api';

interface AdminDealerRow {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  dealer_name: string;
  dealer_slug: string;
  description: string | null;
  address: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  owner_email: string | null;
  owner_name: string | null;
  dealer_verified: boolean;
  dealer_featured: boolean;
  vehicle_count: number;
}

const emptyCreate = () => ({
  owner_email: '',
  name: '',
  slug: '',
});

export default function AdminDealersPage() {
  const [search, setSearch] = useState('');
  const [dealers, setDealers] = useState<AdminDealerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreate);

  const [editOpen, setEditOpen] = useState(false);
  const [editDealer, setEditDealer] = useState<AdminDealerRow | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    slug: '',
    description: '',
    address: '',
    website: '',
    instagram: '',
    facebook: '',
    verified: false,
    featured: false,
  });

  const [deleteTarget, setDeleteTarget] = useState<AdminDealerRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadDealers = async () => {
    try {
      setLoading(true);
      const data = await fetchApi<AdminDealerRow[]>('/admin/dealers', { requireAuth: true });
      setDealers(Array.isArray(data) ? data : []);
    } catch (e: any) {
      toast.error('Erro ao carregar lojistas', { description: e.message });
      setDealers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDealers();
  }, []);

  const filteredDealers = dealers.filter(
    (d) =>
      d.dealer_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.dealer_slug?.toLowerCase().includes(search.toLowerCase()) ||
      (d.owner_email && d.owner_email.toLowerCase().includes(search.toLowerCase())) ||
      (d.city && d.city.toLowerCase().includes(search.toLowerCase())) ||
      (d.state && d.state.toLowerCase().includes(search.toLowerCase())),
  );

  const patchDealer = async (id: string, body: Record<string, unknown>) => {
    await fetchApi(`/admin/dealers/${id}`, {
      method: 'PATCH',
      requireAuth: true,
      body,
    });
    await loadDealers();
  };

  const handleToggleVerified = async (d: AdminDealerRow, checked: boolean) => {
    try {
      await patchDealer(d.id, { verified: checked });
      toast.success(checked ? 'Lojista verificado' : 'Verificação removida');
    } catch (e: any) {
      toast.error('Falha ao atualizar', { description: e.message });
    }
  };

  const handleToggleFeatured = async (d: AdminDealerRow, checked: boolean) => {
    try {
      await patchDealer(d.id, { featured: checked });
      toast.success(checked ? 'Destaque ativado' : 'Destaque removido');
    } catch (e: any) {
      toast.error('Falha ao atualizar', { description: e.message });
    }
  };

  const openCreate = () => {
    setCreateForm(emptyCreate());
    setCreateOpen(true);
  };

  const submitCreate = async () => {
    const email = createForm.owner_email.trim().toLowerCase();
    const name = createForm.name.trim();
    if (!email || !name) {
      toast.error('Preencha e-mail do usuário e nome da loja');
      return;
    }
    setSaving(true);
    try {
      await fetchApi('/admin/dealers', {
        method: 'POST',
        requireAuth: true,
        body: {
          owner_email: email,
          name,
          ...(createForm.slug.trim() ? { slug: createForm.slug.trim() } : {}),
        },
      });
      toast.success('Loja criada e vinculada ao usuário');
      setCreateOpen(false);
      await loadDealers();
    } catch (e: any) {
      toast.error('Não foi possível criar', { description: e.message });
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (d: AdminDealerRow) => {
    setEditDealer(d);
    setEditOpen(true);
    setEditForm({
      name: d.name,
      slug: d.slug,
      description: d.description ?? '',
      address: d.address ?? '',
      website: d.website ?? '',
      instagram: d.instagram ?? '',
      facebook: d.facebook ?? '',
      verified: d.dealer_verified,
      featured: d.dealer_featured,
    });
    setEditOpen(true);
  };

  const submitEdit = async () => {
    if (!editDealer) return;
    const name = editForm.name.trim();
    const slug = editForm.slug.trim();
    if (!name || !slug) {
      toast.error('Nome e slug são obrigatórios');
      return;
    }
    setSaving(true);
    try {
      await fetchApi(`/admin/dealers/${editDealer.id}`, {
        method: 'PATCH',
        requireAuth: true,
        body: {
          name,
          slug,
          description: editForm.description.trim() || null,
          address: editForm.address.trim() || null,
          website: editForm.website.trim() || null,
          instagram: editForm.instagram.trim() || null,
          facebook: editForm.facebook.trim() || null,
          verified: editForm.verified,
          featured: editForm.featured,
        },
      });
      toast.success('Lojista atualizado');
      setEditOpen(false);
      setEditDealer(null);
      await loadDealers();
    } catch (e: any) {
      toast.error('Erro ao salvar', { description: e.message });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetchApi(`/admin/dealers/${deleteTarget.id}`, {
        method: 'DELETE',
        requireAuth: true,
      });
      toast.success('Loja removida');
      setDeleteTarget(null);
      await loadDealers();
    } catch (e: any) {
      toast.error('Erro ao excluir', { description: e.message });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="container py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/admin">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div className="p-2 rounded-lg bg-[#268052]">
                <Store className="h-6 w-6 text-white" />
              </div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold">Gerenciar Lojistas</h1>
            </div>
            <p className="text-muted-foreground">
              Cadastre lojas vinculadas a usuários existentes, edite dados ou remova o perfil de lojista.
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nova loja
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Para vincular uma loja é necessário um{' '}
          <Link href="/admin/usuarios" className="text-primary underline">
            usuário já cadastrado
          </Link>
          . O e-mail deve ser o da conta dona da loja.
        </p>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, slug, e-mail, cidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-xl p-4 shadow-card">
            <Store className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-bold">{dealers.length}</p>
            <p className="text-xs text-muted-foreground">Total de Lojistas</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card">
            <BadgeCheck className="h-5 w-5 text-green-500 mb-2" />
            <p className="text-2xl font-bold">{dealers.filter((d) => d.dealer_verified).length}</p>
            <p className="text-xs text-muted-foreground">Verificados</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card">
            <Star className="h-5 w-5 text-yellow-500 mb-2" />
            <p className="text-2xl font-bold">{dealers.filter((d) => d.dealer_featured).length}</p>
            <p className="text-xs text-muted-foreground">Em Destaque</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card">
            <Car className="h-5 w-5 text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{dealers.reduce((acc, d) => acc + d.vehicle_count, 0)}</p>
            <p className="text-xs text-muted-foreground">Total de Veículos</p>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lojista</TableHead>
                <TableHead className="hidden md:table-cell">Dono</TableHead>
                <TableHead className="hidden md:table-cell">Localização</TableHead>
                <TableHead className="hidden md:table-cell">Contato</TableHead>
                <TableHead className="text-center">Veículos</TableHead>
                <TableHead className="text-center">Verificado</TableHead>
                <TableHead className="text-center">Destaque</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDealers.length > 0 ? (
                filteredDealers.map((dealer) => (
                  <TableRow key={dealer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#268052] flex items-center justify-center text-white font-bold shrink-0">
                          {dealer.dealer_name?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium line-clamp-1">{dealer.dealer_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{dealer.dealer_slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      <div className="text-muted-foreground line-clamp-1">{dealer.owner_name || '—'}</div>
                      <div className="text-xs truncate">{dealer.owner_email || '—'}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {dealer.city && dealer.state ? (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {dealer.city}, {dealer.state}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {dealer.phone ? (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3 shrink-0" />
                          {dealer.phone}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{dealer.vehicle_count}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={dealer.dealer_verified}
                        onCheckedChange={(v) => void handleToggleVerified(dealer, v)}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={dealer.dealer_featured}
                        onCheckedChange={(v) => void handleToggleFeatured(dealer, v)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild title="Ver vitrine">
                        <Link href={`/loja/${dealer.dealer_slug}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" title="Editar" onClick={() => openEdit(dealer)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        title="Excluir loja"
                        onClick={() => setDeleteTarget(dealer)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {search ? 'Nenhum lojista encontrado' : 'Nenhum lojista cadastrado'}
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova loja</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-2">
              <Label htmlFor="cd-email">E-mail do usuário (dono)</Label>
              <Input
                id="cd-email"
                type="email"
                autoComplete="email"
                placeholder="conta@email.com"
                value={createForm.owner_email}
                onChange={(e) => setCreateForm((f) => ({ ...f, owner_email: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cd-name">Nome da loja</Label>
              <Input
                id="cd-name"
                value={createForm.name}
                onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cd-slug">Slug da URL (opcional)</Label>
              <Input
                id="cd-slug"
                placeholder="auto-moreira"
                value={createForm.slug}
                onChange={(e) => setCreateForm((f) => ({ ...f, slug: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" disabled={saving} onClick={() => void submitCreate()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editOpen}
        onOpenChange={(o) => {
          if (!o) {
            setEditOpen(false);
            setEditDealer(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar lojista</DialogTitle>
          </DialogHeader>
          {editDealer && (
            <>
              <p className="text-xs text-muted-foreground">
                Dono: {editDealer.owner_name} • {editDealer.owner_email}
              </p>
              <div className="grid gap-3 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="ed-name">Nome da loja</Label>
                  <Input
                    id="ed-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ed-slug">Slug (URL)</Label>
                  <Input
                    id="ed-slug"
                    value={editForm.slug}
                    onChange={(e) => setEditForm((f) => ({ ...f, slug: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ed-desc">Descrição</Label>
                  <Textarea
                    id="ed-desc"
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ed-addr">Endereço</Label>
                  <Input
                    id="ed-addr"
                    value={editForm.address}
                    onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="grid gap-2">
                    <Label htmlFor="ed-web">Site</Label>
                    <Input
                      id="ed-web"
                      value={editForm.website}
                      onChange={(e) => setEditForm((f) => ({ ...f, website: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ed-ig">Instagram</Label>
                    <Input
                      id="ed-ig"
                      value={editForm.instagram}
                      onChange={(e) => setEditForm((f) => ({ ...f, instagram: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ed-fb">Facebook</Label>
                    <Input
                      id="ed-fb"
                      value={editForm.facebook}
                      onChange={(e) => setEditForm((f) => ({ ...f, facebook: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="ed-ver"
                      checked={editForm.verified}
                      onCheckedChange={(v) => setEditForm((f) => ({ ...f, verified: v }))}
                    />
                    <Label htmlFor="ed-ver">Verificado</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="ed-feat"
                      checked={editForm.featured}
                      onCheckedChange={(v) => setEditForm((f) => ({ ...f, featured: v }))}
                    />
                    <Label htmlFor="ed-feat">Destaque na home</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setEditOpen(false);
                    setEditDealer(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="button" disabled={saving} onClick={() => void submitEdit()}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir loja?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove o perfil de lojista de <strong>{deleteTarget?.dealer_name}</strong>. O usuário e os anúncios
              de veículos permanecem; apenas o vínculo com a loja some. Planos em &quot;Planos de Lojista&quot;
              deixam de listar esta loja.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
              }}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
