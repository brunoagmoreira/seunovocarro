"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, ExternalLink, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface BlogPost {
  id: string; title: string; slug: string; status: string; views_count: number;
  published_at: string | null; created_at: string; featured_image: string | null;
  category: { name: string; color: string } | null;
}

const mockPosts: BlogPost[] = [
  { id: '1', title: 'Como escolher seu primeiro carro seminovo', slug: 'como-escolher-primeiro-carro-seminovo', status: 'published', views_count: 1245, published_at: '2026-03-15T10:00:00Z', created_at: '2026-03-14T08:00:00Z', featured_image: null, category: { name: 'Dicas', color: '#22c55e' } },
  { id: '2', title: '10 dicas para financiar um veículo com sucesso', slug: '10-dicas-financiar-veiculo', status: 'published', views_count: 890, published_at: '2026-03-10T10:00:00Z', created_at: '2026-03-09T08:00:00Z', featured_image: null, category: { name: 'Financiamento', color: '#3b82f6' } },
  { id: '3', title: 'SUVs mais vendidos de 2026: ranking completo', slug: 'suvs-mais-vendidos-2026', status: 'draft', views_count: 0, published_at: null, created_at: '2026-03-20T08:00:00Z', featured_image: null, category: { name: 'Rankings', color: '#a855f7' } },
  { id: '4', title: 'Manutenção preventiva: o guia definitivo', slug: 'manutencao-preventiva-guia', status: 'published', views_count: 2100, published_at: '2026-02-28T10:00:00Z', created_at: '2026-02-27T08:00:00Z', featured_image: null, category: { name: 'Manutenção', color: '#f59e0b' } },
  { id: '5', title: 'Carros elétricos vs híbridos: qual escolher?', slug: 'carros-eletricos-vs-hibridos', status: 'archived', views_count: 560, published_at: '2026-01-15T10:00:00Z', created_at: '2026-01-14T08:00:00Z', featured_image: null, category: { name: 'Tecnologia', color: '#06b6d4' } },
];

export default function AdminBlogPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [posts, setPosts] = useState<BlogPost[]>(mockPosts);

  const filtered = posts.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleDelete = (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    toast.success('Artigo excluído com sucesso');
  };

  const handleTogglePublish = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    setPosts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus, published_at: newStatus === 'published' ? new Date().toISOString() : null } : p));
    toast.success(newStatus === 'published' ? 'Artigo publicado!' : 'Artigo despublicado');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published': return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Publicado</Badge>;
      case 'draft': return <Badge variant="secondary">Rascunho</Badge>;
      case 'archived': return <Badge variant="outline">Arquivado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild><Link href="/admin"><ArrowLeft className="h-5 w-5" /></Link></Button>
          <div><h1 className="font-heading text-3xl font-bold">Blog</h1><p className="text-muted-foreground">Gerencie os artigos do blog</p></div>
        </div>
        <Button asChild><Link href="/admin/blog/novo"><Plus className="mr-2 h-4 w-4" />Novo Artigo</Link></Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar artigos..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="published">Publicados</SelectItem>
            <SelectItem value="draft">Rascunhos</SelectItem>
            <SelectItem value="archived">Arquivados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead className="hidden md:table-cell">Categoria</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Views</TableHead>
              <TableHead className="hidden md:table-cell">Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? filtered.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  <p className="font-medium line-clamp-1">{post.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1 md:hidden">{post.category?.name}</p>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {post.category && (<Badge variant="outline" style={{ borderColor: post.category.color, color: post.category.color }}>{post.category.name}</Badge>)}
                </TableCell>
                <TableCell className="hidden md:table-cell">{getStatusBadge(post.status)}</TableCell>
                <TableCell className="hidden md:table-cell">{post.views_count}</TableCell>
                <TableCell className="hidden md:table-cell">{post.published_at ? new Date(post.published_at).toLocaleDateString('pt-BR') : new Date(post.created_at).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    {post.status === 'published' && (<Button variant="ghost" size="icon" asChild><a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a></Button>)}
                    <Button variant="ghost" size="icon" onClick={() => handleTogglePublish(post.id, post.status)}>
                      {post.status === 'published' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" asChild><Link href={`/admin/blog/${post.id}/editar`}><Edit className="h-4 w-4" /></Link></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir artigo?</AlertDialogTitle>
                          <AlertDialogDescription>Esta ação não pode ser desfeita. O artigo &quot;{post.title}&quot; será permanentemente excluído.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(post.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <p className="text-muted-foreground">Nenhum artigo encontrado.</p>
                  <Button asChild className="mt-4"><Link href="/admin/blog/novo"><Plus className="mr-2 h-4 w-4" />Criar primeiro artigo</Link></Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
