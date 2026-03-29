'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit2, Trash2, GripVertical, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
  order: number;
  is_active: boolean;
}

export function AdminBannersClient() {
  const { isAdmin } = useAuth();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '',
    order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const data = await fetchApi<Banner[]>('/banners');
      setBanners(data);
    } catch (error) {
      toast.error('Erro ao carregar os banners.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', subtitle: '', image_url: '', link_url: '', order: 0, is_active: true });
    setIsEditing(null);
  };

  const handleEdit = (banner: Banner) => {
    setIsEditing(banner.id);
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      image_url: banner.image_url || '',
      link_url: banner.link_url || '',
      order: banner.order,
      is_active: banner.is_active,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este banner?')) return;
    try {
      await fetchApi(`/banners/${id}`, { method: 'DELETE', requireAuth: true });
      toast.success('Banner removido com sucesso!');
      fetchBanners();
    } catch (error) {
      toast.error('Erro ao remover banner.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await fetchApi(`/banners/${isEditing}`, { method: 'PATCH', body: formData, requireAuth: true });
        toast.success('Banner atualizado com sucesso!');
      } else {
        await fetchApi('/banners', { method: 'POST', body: formData, requireAuth: true });
        toast.success('Banner criado com sucesso!');
      }
      fetchBanners();
      resetForm();
    } catch (error) {
      toast.error('Erro ao salvar o banner.');
    }
  };

  if (!isAdmin) {
    return (
      <div className="container py-24 text-center">
        <h2 className="text-2xl font-bold text-destructive">Acesso Negado</h2>
        <p className="text-muted-foreground mt-2">Você não tem permissão de administrador para visualizar esta página.</p>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-heading font-black text-foreground">Gestão de Banners</h1>
          <p className="text-muted-foreground mt-1">Configure o carrossel que aparece na página inicial.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulário de Criação/Edição */}
        <div className="lg:col-span-1 bg-card border border-border rounded-xl p-6 shadow-sm h-fit">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            {isEditing ? <Edit2 className="w-5 h-5 text-kairos-primary" /> : <Plus className="w-5 h-5 text-kairos-primary" />}
            {isEditing ? 'Editar Banner' : 'Novo Banner'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image_url">URL da Imagem (S3, Imgur, Cloudflare)</Label>
              <Input 
                id="image_url" 
                value={formData.image_url} 
                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                placeholder="https://..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título Principal (Headline)</Label>
              <Input 
                id="title" 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Carros verificados, perto de você."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtítulo (Apoio)</Label>
              <Input 
                id="subtitle" 
                value={formData.subtitle} 
                onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                placeholder="Veículos inspecionados de lojas..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link_url">Link do Botão de Ação</Label>
              <Input 
                id="link_url" 
                value={formData.link_url} 
                onChange={(e) => setFormData({...formData, link_url: e.target.value})}
                placeholder="/veiculos"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order">Ordem (Fila)</Label>
                <Input 
                  id="order" 
                  type="number"
                  value={formData.order} 
                  onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                />
              </div>

              <div className="space-y-2 flex flex-col justify-end pb-2">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="active" 
                    checked={formData.is_active} 
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <Label htmlFor="active">Ativo no site</Label>
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-2">
              <Button type="submit" className="flex-1 bg-kairos-primary hover:bg-kairos-primary/90">
                {isEditing ? 'Atualizar' : 'Salvar Banner'}
              </Button>
              {isEditing && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Lista de Banners */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Banners Publicados</h2>
          
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Carregando vitrine...</div>
          ) : banners.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 border border-dashed border-border rounded-xl">
              <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-20" />
              <p className="text-muted-foreground">Nenhum banner cadastrado ainda.</p>
              <p className="text-sm text-muted-foreground mt-1">Crie o seu primeiro ao lado para aparecer na home.</p>
            </div>
          ) : (
            banners.map((banner) => (
              <div key={banner.id} className={`flex flex-col sm:flex-row items-center bg-card border ${banner.is_active ? 'border-primary/20' : 'border-border opacity-60'} rounded-xl p-4 shadow-sm gap-4 transition-all hover:shadow-md`}>
                
                <div className="cursor-move text-muted-foreground hover:text-foreground">
                  <GripVertical className="w-5 h-5" />
                </div>
                
                <div className="w-full sm:w-32 h-20 bg-muted rounded-lg overflow-hidden shrink-0 border border-border">
                  {banner.image_url ? (
                    <img src={banner.image_url} alt={banner.title || 'Banner'} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">Sem Foto</div>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-semibold text-foreground line-clamp-1">{banner.title || 'Sem título'}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{banner.subtitle || banner.link_url || 'Sem descrição'}</p>
                  <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                    <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">Ordem: {banner.order}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${banner.is_active ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}>
                      {banner.is_active ? 'Ativo' : 'Pausado'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(banner)}>
                    <Edit2 className="w-4 h-4 text-blue-500" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleDelete(banner.id)} className="hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
