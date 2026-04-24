"use client";

import { useState, useEffect } from 'react';
import {
  Check,
  X,
  UserCog,
  Shield,
  User,
  Search,
  Download,
  ArrowLeft,
  Pencil,
  Plus,
  Trash2,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { downloadCsv, csvFilename } from '@/lib/csvExport';

interface UserWithRole {
  id: string;
  role: 'user' | 'editor' | 'admin';
  status: 'pending' | 'active' | 'suspended';
  email: string;
  full_name: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  created_at: string;
  dealer?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface ProfileResponse {
  id?: string;
  is_super_admin?: boolean;
}

type UserForm = {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  city: string;
  state: string;
  role: 'user' | 'editor' | 'admin';
  status: 'pending' | 'active' | 'suspended';
};

const emptyForm = (): UserForm => ({
  email: '',
  password: '',
  full_name: '',
  phone: '',
  city: '',
  state: '',
  role: 'user',
  status: 'active',
});

const roleIcons = {
  user: User,
  editor: UserCog,
  admin: Shield,
};

const roleLabels = {
  user: 'Usuário',
  editor: 'Vendedor',
  admin: 'Admin',
};

const statusLabels = {
  pending: 'Pendente',
  active: 'Ativo',
  suspended: 'Suspenso',
};

function canEditUser(isSuperAdmin: boolean, u: UserWithRole): boolean {
  if (u.role === 'admin' && !isSuperAdmin) return false;
  return true;
}

function canDeleteUser(
  isSuperAdmin: boolean,
  currentUserId: string | null,
  u: UserWithRole,
): boolean {
  if (!currentUserId || u.id === currentUserId) return false;
  if (u.role === 'admin' && !isSuperAdmin) return false;
  return true;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [isSavingUser, setIsSavingUser] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<UserWithRole | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    void loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);

      const [profile, usersData] = await Promise.all([
        fetchApi<ProfileResponse>('/users/profile', { requireAuth: true }),
        fetchApi<UserWithRole[]>('/admin/users', { requireAuth: true }),
      ]);

      setCurrentUserId(profile?.id ?? null);
      setIsSuperAdmin(Boolean(profile.is_super_admin));
      setUsers(usersData);
    } catch (error: any) {
      toast.error('Erro ao carregar usuários', {
        description: error.message || 'Não foi possível buscar dados do admin.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setDialogMode('create');
    setEditingUserId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEditDialog = (u: UserWithRole) => {
    if (!canEditUser(isSuperAdmin, u)) {
      toast.error('Sem permissão para editar este usuário');
      return;
    }
    setDialogMode('edit');
    setEditingUserId(u.id);
    setForm({
      email: u.email,
      password: '',
      full_name: u.full_name ?? '',
      phone: u.phone ?? '',
      city: u.city ?? '',
      state: u.state ?? '',
      role: u.role,
      status: u.status,
    });
    setDialogOpen(true);
  };

  const handleSaveUser = async () => {
    const email = form.email.trim().toLowerCase();
    if (!email) {
      toast.error('E-mail obrigatório');
      return;
    }
    if (dialogMode === 'create' && form.password.length < 6) {
      toast.error('Senha com pelo menos 6 caracteres');
      return;
    }
    if (dialogMode === 'edit' && form.password.length > 0 && form.password.length < 6) {
      toast.error('Senha com pelo menos 6 caracteres');
      return;
    }

    setIsSavingUser(true);
    try {
      if (dialogMode === 'create') {
        const created = await fetchApi<UserWithRole>('/admin/users', {
          method: 'POST',
          requireAuth: true,
          body: {
            email,
            password: form.password,
            full_name: form.full_name.trim() || undefined,
            phone: form.phone.trim() || undefined,
            city: form.city.trim() || undefined,
            state: form.state.trim().toUpperCase() || undefined,
            role: form.role,
            status: form.status,
          },
        });
        setUsers((prev) => [created, ...prev]);
        toast.success('Usuário criado');
      } else if (editingUserId) {
        const body: Record<string, unknown> = {
          email,
          full_name: form.full_name.trim() || undefined,
          phone: form.phone.trim() || undefined,
          city: form.city.trim() || undefined,
          state: form.state.trim().toUpperCase() || undefined,
          role: form.role,
          status: form.status,
        };
        if (form.password.trim().length >= 6) {
          body.password = form.password;
        }
        const updated = await fetchApi<UserWithRole>(
          `/admin/users/${editingUserId}`,
          {
            method: 'PATCH',
            requireAuth: true,
            body,
          },
        );
        setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
        toast.success('Usuário atualizado');
      }
      setDialogOpen(false);
    } catch (error: any) {
      toast.error(dialogMode === 'create' ? 'Erro ao criar' : 'Erro ao atualizar', {
        description: error.message || 'Tente novamente.',
      });
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await fetchApi(`/admin/users/${deleteTarget.id}`, {
        method: 'DELETE',
        requireAuth: true,
      });
      setUsers((prev) => prev.filter((x) => x.id !== deleteTarget.id));
      toast.success('Usuário excluído');
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error('Erro ao excluir', {
        description: error.message || 'Tente novamente.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSellerDecision = async (userId: string, decision: 'approve' | 'reject') => {
    try {
      setIsUpdating(userId);
      await fetchApi(`/admin/approvals/sellers/${userId}`, {
        method: 'PATCH',
        requireAuth: true,
        body: { decision },
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, status: decision === 'approve' ? 'active' : 'suspended' }
            : u,
        ),
      );

      toast.success(decision === 'approve' ? 'Vendedor aprovado!' : 'Vendedor rejeitado', {
        description:
          decision === 'approve'
            ? 'Esse perfil já pode criar anúncios.'
            : 'Esse perfil foi suspenso para novos anúncios.',
      });
    } catch (error: any) {
      toast.error('Falha ao atualizar aprovação', {
        description: error.message || 'Tente novamente.',
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filterRole !== 'all' && user.role !== filterRole) return false;
    if (filterStatus !== 'all' && user.status !== filterStatus) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesName = user.full_name?.toLowerCase().includes(search);
      const matchesPhone = user.phone?.includes(search);
      const matchesCity = user.city?.toLowerCase().includes(search);
      const matchesEmail = user.email.toLowerCase().includes(search);
      if (!matchesName && !matchesPhone && !matchesCity && !matchesEmail) return false;
    }
    return true;
  });

  const handleExportUsers = () => {
    if (filteredUsers.length === 0) {
      toast.warning('Nada para exportar', { description: 'Ajuste os filtros ou aguarde novos cadastros.' });
      return;
    }
    const headers = [
      'id',
      'email',
      'nome',
      'papel',
      'papel_codigo',
      'situacao',
      'situacao_codigo',
      'telefone',
      'cidade',
      'uf',
      'loja_nome',
      'loja_slug',
      'criado_em',
    ];
    const rows = filteredUsers.map((u) => [
      u.id,
      u.email,
      u.full_name ?? '',
      roleLabels[u.role],
      u.role,
      statusLabels[u.status],
      u.status,
      u.phone ?? '',
      u.city ?? '',
      u.state ?? '',
      u.dealer?.name ?? '',
      u.dealer?.slug ?? '',
      u.created_at,
    ]);
    downloadCsv(csvFilename('usuarios-admin'), headers, rows);
    toast.success('Arquivo gerado', {
      description: `${filteredUsers.length} usuário(s) no CSV (separador ;, UTF-8).`,
    });
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="container py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="font-heading text-2xl font-bold">Gerenciar Usuários</h1>
            <Badge variant="secondary">
              {filteredUsers.length} de {users.length}
            </Badge>
            {isSuperAdmin && <Badge>Super Admin</Badge>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" type="button" onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Novo usuário
            </Button>
            <Button variant="outline" size="sm" type="button" onClick={handleExportUsers}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, telefone, cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="user">Usuários</SelectItem>
              <SelectItem value="editor">Vendedores</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="suspended">Suspensos</SelectItem>
            </SelectContent>
          </Select>

          {(searchTerm || filterRole !== 'all' || filterStatus !== 'all') && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSearchTerm('');
                setFilterRole('all');
                setFilterStatus('all');
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Nenhum usuário encontrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => {
              const RoleIcon = roleIcons[user.role];
              const location = [user.city?.trim(), user.state?.trim()].filter(Boolean).join(', ');
              const showEdit = canEditUser(isSuperAdmin, user);
              const showDelete = canDeleteUser(isSuperAdmin, currentUserId, user);
              return (
                <div
                  key={user.id}
                  className="bg-card rounded-2xl p-4 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="p-3 rounded-xl gradient-kairos-soft shrink-0">
                      <RoleIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-heading font-semibold truncate">
                          {user.full_name || 'Usuário sem nome'}
                        </p>
                        <Badge
                          variant={
                            user.status === 'active'
                              ? 'default'
                              : user.status === 'pending'
                                ? 'outline'
                                : 'destructive'
                          }
                        >
                          {statusLabels[user.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {roleLabels[user.role]}
                        {location ? ` · ${location}` : ''}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      {user.phone && (
                        <p className="text-sm text-muted-foreground">{user.phone}</p>
                      )}
                      {user.dealer?.name && (
                        <p className="text-xs text-muted-foreground">Loja: {user.dealer.name}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {showEdit && (
                      <Button variant="outline" size="sm" type="button" onClick={() => openEditDialog(user)}>
                        <Pencil className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    )}
                    {showDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(user)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    )}
                    {isSuperAdmin && user.status === 'pending' && user.role === 'editor' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isUpdating === user.id}
                          onClick={() => handleSellerDecision(user.id, 'approve')}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" /> Aprovar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isUpdating === user.id}
                          onClick={() => handleSellerDecision(user.id, 'reject')}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4 mr-1" /> Rejeitar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create' ? 'Novo usuário' : 'Editar usuário'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-2">
              <Label htmlFor="u-email">E-mail</Label>
              <Input
                id="u-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="u-password">
                {dialogMode === 'create' ? 'Senha' : 'Nova senha (opcional)'}
              </Label>
              <Input
                id="u-password"
                type="password"
                autoComplete={dialogMode === 'create' ? 'new-password' : 'new-password'}
                placeholder={dialogMode === 'edit' ? 'Deixe em branco para manter' : ''}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="u-name">Nome</Label>
              <Input
                id="u-name"
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="u-phone">Telefone</Label>
              <Input
                id="u-phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="u-city">Cidade</Label>
                <Input
                  id="u-city"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="u-state">UF</Label>
                <Input
                  id="u-state"
                  maxLength={2}
                  value={form.state}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, state: e.target.value.toUpperCase() }))
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Papel</Label>
              <Select
                value={form.role}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, role: v as UserForm['role'] }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">{roleLabels.user}</SelectItem>
                  <SelectItem value="editor">{roleLabels.editor}</SelectItem>
                  {(isSuperAdmin || form.role === 'admin') && (
                    <SelectItem value="admin">{roleLabels.admin}</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {!isSuperAdmin && (
                <p className="text-xs text-muted-foreground">
                  Apenas super admin pode criar ou atribuir papel Admin.
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, status: v as UserForm['status'] }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">{statusLabels.pending}</SelectItem>
                  <SelectItem value="active">{statusLabels.active}</SelectItem>
                  <SelectItem value="suspended">{statusLabels.suspended}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" disabled={isSavingUser} onClick={() => void handleSaveUser()}>
              {isSavingUser ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando…
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Veículos e dados vinculados a{' '}
              <strong>{deleteTarget?.full_name || deleteTarget?.email}</strong> serão removidos em
              cascata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                void handleConfirmDelete();
              }}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin inline" />
                  Excluindo…
                </>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
