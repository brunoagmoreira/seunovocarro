"use client";

import { useState, useEffect } from 'react';
import { Check, X, UserCog, Shield, User, Search, Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  is_super_admin?: boolean;
}

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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredUsers = users.filter(user => {
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild><Link href="/admin"><ArrowLeft className="h-5 w-5" /></Link></Button>
            <h1 className="font-heading text-2xl font-bold">Gerenciar Usuários</h1>
            <Badge variant="secondary">{filteredUsers.length} de {users.length}</Badge>
            {isSuperAdmin && <Badge>Super Admin</Badge>}
          </div>
          <Button variant="outline" size="sm" type="button" onClick={handleExportUsers}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        {/* Filters */}
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
            <Button variant="ghost" size="icon" onClick={() => { setSearchTerm(''); setFilterRole('all'); setFilterStatus('all'); }}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Users List */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Nenhum usuário encontrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => {
              const RoleIcon = roleIcons[user.role];
              const location = [user.city?.trim(), user.state?.trim()].filter(Boolean).join(', ');
              return (
                <div key={user.id} className="bg-card rounded-2xl p-4 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl gradient-kairos-soft">
                      <RoleIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-heading font-semibold">{user.full_name || 'Usuário sem nome'}</p>
                        <Badge variant={user.status === 'active' ? 'default' : user.status === 'pending' ? 'outline' : 'destructive'}>
                          {statusLabels[user.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {roleLabels[user.role]}
                        {location ? ` · ${location}` : ''}
                      </p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      {user.phone && (
                        <p className="text-sm text-muted-foreground">{user.phone}</p>
                      )}
                      {user.dealer?.name && (
                        <p className="text-xs text-muted-foreground">Loja: {user.dealer.name}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
    </div>
  );
}
