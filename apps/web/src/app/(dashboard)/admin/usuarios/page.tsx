"use client";

import { useState, useEffect } from 'react';
import { Check, X, UserCog, Shield, User, Search, Download } from 'lucide-react';
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

interface UserWithRole {
  id: string;
  user_id: string;
  role: 'user' | 'editor' | 'admin';
  status: 'pending' | 'active' | 'suspended';
  created_at: string;
  profiles: {
    full_name: string | null;
    city: string | null;
    state: string | null;
    phone: string | null;
  } | null;
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
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Mock data - será conectado à API NestJS futuramente
    setTimeout(() => {
      setUsers([
        { id: '1', user_id: 'u1', role: 'admin', status: 'active', created_at: new Date().toISOString(), profiles: { full_name: 'Admin Master', city: 'São Paulo', state: 'SP', phone: '(11) 99999-0001' } },
        { id: '2', user_id: 'u2', role: 'editor', status: 'active', created_at: new Date().toISOString(), profiles: { full_name: 'Carlos Silva Motors', city: 'Belo Horizonte', state: 'MG', phone: '(31) 98888-1234' } },
        { id: '3', user_id: 'u3', role: 'editor', status: 'pending', created_at: new Date().toISOString(), profiles: { full_name: 'Ana Souza Veículos', city: 'Curitiba', state: 'PR', phone: '(41) 97777-5678' } },
        { id: '4', user_id: 'u4', role: 'user', status: 'active', created_at: new Date().toISOString(), profiles: { full_name: 'João Comprador', city: 'Rio de Janeiro', state: 'RJ', phone: '(21) 96666-9012' } },
        { id: '5', user_id: 'u5', role: 'editor', status: 'suspended', created_at: new Date().toISOString(), profiles: { full_name: 'Pedro Autos', city: 'Salvador', state: 'BA', phone: '(71) 95555-3456' } },
        { id: '6', user_id: 'u6', role: 'editor', status: 'pending', created_at: new Date().toISOString(), profiles: { full_name: 'Marina Premium Cars', city: 'Brasília', state: 'DF', phone: '(61) 94444-7890' } },
        { id: '7', user_id: 'u7', role: 'user', status: 'active', created_at: new Date().toISOString(), profiles: { full_name: 'Roberto Oliveira', city: 'Porto Alegre', state: 'RS', phone: '(51) 93333-2345' } },
      ]);
      setIsLoading(false);
    }, 800);
  }, []);

  const updateUserStatus = async (userRoleId: string, newStatus: 'active' | 'suspended') => {
    setUsers(prev => prev.map(u => u.id === userRoleId ? { ...u, status: newStatus } : u));
    toast.success(newStatus === 'active' ? 'Usuário aprovado!' : 'Usuário suspenso', {
      description: newStatus === 'active' ? 'O vendedor agora pode criar anúncios.' : 'O usuário foi suspenso.',
    });
  };

  const filteredUsers = users.filter(user => {
    if (filterRole !== 'all' && user.role !== filterRole) return false;
    if (filterStatus !== 'all' && user.status !== filterStatus) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesName = user.profiles?.full_name?.toLowerCase().includes(search);
      const matchesPhone = user.profiles?.phone?.includes(search);
      const matchesCity = user.profiles?.city?.toLowerCase().includes(search);
      if (!matchesName && !matchesPhone && !matchesCity) return false;
    }
    return true;
  });

  const handleExportUsers = () => {
    toast.success('Exportado!', { description: `${filteredUsers.length} usuários exportados para CSV.` });
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
            <h1 className="font-heading text-2xl font-bold">Gerenciar Usuários</h1>
            <Badge variant="secondary">{filteredUsers.length} de {users.length}</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportUsers}>
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
              return (
                <div key={user.id} className="bg-card rounded-2xl p-4 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl gradient-kairos-soft">
                      <RoleIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-heading font-semibold">{user.profiles?.full_name || 'Usuário sem nome'}</p>
                        <Badge variant={user.status === 'active' ? 'default' : user.status === 'pending' ? 'outline' : 'destructive'}>
                          {statusLabels[user.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {roleLabels[user.role]} • {user.profiles?.city}, {user.profiles?.state}
                      </p>
                      {user.profiles?.phone && (
                        <p className="text-sm text-muted-foreground">{user.profiles.phone}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {user.status === 'pending' && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => updateUserStatus(user.id, 'active')} className="text-green-600 hover:text-green-700">
                          <Check className="h-4 w-4 mr-1" /> Aprovar
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => updateUserStatus(user.id, 'suspended')} className="text-destructive hover:text-destructive">
                          <X className="h-4 w-4 mr-1" /> Rejeitar
                        </Button>
                      </>
                    )}
                    {user.status === 'active' && user.role !== 'admin' && (
                      <Button variant="ghost" size="sm" onClick={() => updateUserStatus(user.id, 'suspended')} className="text-destructive">Suspender</Button>
                    )}
                    {user.status === 'suspended' && (
                      <Button variant="ghost" size="sm" onClick={() => updateUserStatus(user.id, 'active')}>Reativar</Button>
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
