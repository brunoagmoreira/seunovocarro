"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye, Loader2, Pencil, Camera, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { fetchApi } from '@/lib/api';
import { compressImage } from '@/lib/imageCompression';
import ReactMarkdown from 'react-markdown';

const generateSlug = (title: string) =>
  title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const calculateReadingTime = (content: string) =>
  Math.max(1, Math.ceil(content.trim().split(/\s+/).filter(Boolean).length / 200));

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface AdminPostResponse {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  featured_image_alt: string | null;
  category_id: string | null;
  status: string;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[];
  reading_time_minutes: number;
}

export function BlogPostEditor({ postId }: { postId?: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isPending, setIsPending] = useState(false);
  const [loading, setLoading] = useState(!!postId);
  const [autoSlug, setAutoSlug] = useState(true);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatColor, setNewCatColor] = useState('#3B82F6');
  const [catSlugManual, setCatSlugManual] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    featured_image_alt: '',
    category_id: '',
    status: 'draft',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    reading_time_minutes: 5,
  });

  const loadCategories = useCallback(async () => {
    try {
      const data = await fetchApi<BlogCategory[]>('/blog/admin/categories', { requireAuth: true });
      setCategories(data);
    } catch (e: any) {
      toast.error('Erro ao carregar categorias', { description: e.message });
    }
  }, []);

  const resetNewCategoryForm = useCallback(() => {
    setNewCatName('');
    setNewCatSlug('');
    setNewCatColor('#3B82F6');
    setCatSlugManual(false);
  }, []);

  const openNewCategoryDialog = () => {
    resetNewCategoryForm();
    setCategoryDialogOpen(true);
  };

  const handleNewCatNameChange = (value: string) => {
    setNewCatName(value);
    if (!catSlugManual) {
      setNewCatSlug(generateSlug(value));
    }
  };

  const handleCreateCategory = async () => {
    const name = newCatName.trim();
    if (name.length < 2) {
      toast.error('Informe um nome com pelo menos 2 caracteres.');
      return;
    }
    setSavingCategory(true);
    try {
      const body: { name: string; color: string; slug?: string } = {
        name,
        color: newCatColor,
      };
      if (catSlugManual && newCatSlug.trim()) {
        body.slug = newCatSlug.trim().toLowerCase();
      }
      const created = await fetchApi<BlogCategory>('/blog/admin/categories', {
        method: 'POST',
        requireAuth: true,
        body,
      });
      toast.success('Categoria criada');
      setCategoryDialogOpen(false);
      resetNewCategoryForm();
      await loadCategories();
      setFormData((prev) => ({ ...prev, category_id: created.id }));
    } catch (e: any) {
      toast.error('Não foi possível criar a categoria', { description: e.message });
    } finally {
      setSavingCategory(false);
    }
  };

  const loadPost = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const p = await fetchApi<AdminPostResponse>(`/blog/admin/posts/${postId}`, { requireAuth: true });
      setAutoSlug(false);
      setFormData({
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt || '',
        content: p.content,
        featured_image: p.featured_image || '',
        featured_image_alt: p.featured_image_alt || '',
        category_id: p.category_id || '',
        status: p.status,
        meta_title: p.meta_title || '',
        meta_description: p.meta_description || '',
        meta_keywords: Array.isArray(p.meta_keywords) ? p.meta_keywords.join(', ') : '',
        reading_time_minutes: p.reading_time_minutes || 5,
      });
    } catch (e: any) {
      toast.error('Erro ao carregar artigo', { description: e.message });
      router.push('/admin/blog');
    } finally {
      setLoading(false);
    }
  }, [postId, router]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (postId) void loadPost();
  }, [postId, loadPost]);

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: autoSlug ? generateSlug(title) : prev.slug,
    }));
  };

  const handleContentChange = (content: string) => {
    setFormData((prev) => ({
      ...prev,
      content,
      reading_time_minutes: calculateReadingTime(content),
    }));
  };

  const handleFeaturedUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file?.type.startsWith('image/')) {
      toast.error('Selecione uma imagem');
      return;
    }
    setUploadingImage(true);
    try {
      let blob: Blob | File = file;
      if (file.size > 800 * 1024) {
        blob = await compressImage(file, 1.2, 1600);
      }
      const fd = new FormData();
      fd.append('file', blob instanceof File ? blob : new File([blob], file.name, { type: file.type }));
      const res = await fetchApi<{ url: string }>('/media/upload/avatar', {
        method: 'POST',
        body: fd,
        requireAuth: true,
      });
      setFormData((prev) => ({ ...prev, featured_image: res.url }));
      toast.success('Imagem principal enviada');
    } catch (err: any) {
      toast.error('Falha no upload', { description: err.message });
    } finally {
      setUploadingImage(false);
    }
  };

  const buildPayload = (publishNow: boolean) => {
    const status = publishNow ? 'published' : formData.status;
    return {
      title: formData.title.trim(),
      slug: formData.slug.trim().toLowerCase(),
      content: formData.content,
      excerpt: formData.excerpt.trim() || undefined,
      featured_image: formData.featured_image.trim() || undefined,
      featured_image_alt: formData.featured_image_alt.trim() || undefined,
      category_id: formData.category_id || undefined,
      status,
      meta_title: formData.meta_title.trim() || undefined,
      meta_description: formData.meta_description.trim() || undefined,
      meta_keywords: formData.meta_keywords.trim() || undefined,
      reading_time_minutes: formData.reading_time_minutes,
    };
  };

  const handleSubmit = async (publishNow: boolean) => {
    if (!formData.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }
    if (!formData.slug.trim()) {
      toast.error('Slug é obrigatório');
      return;
    }
    if (!formData.content.trim()) {
      toast.error('Conteúdo é obrigatório (Markdown aceito)');
      return;
    }
    setIsPending(true);
    try {
      const body = buildPayload(publishNow);
      if (postId) {
        await fetchApi(`/blog/admin/posts/${postId}`, {
          method: 'PATCH',
          body,
          requireAuth: true,
        });
        toast.success(
          body.status === 'published' ? 'Artigo atualizado (público).' : 'Artigo atualizado (rascunho).',
        );
      } else {
        await fetchApi('/blog/admin/posts', {
          method: 'POST',
          body,
          requireAuth: true,
        });
        toast.success(body.status === 'published' ? 'Artigo publicado!' : 'Rascunho salvo!');
      }
      router.push('/admin/blog');
      router.refresh();
    } catch (e: any) {
      toast.error('Erro ao salvar', { description: e.message });
    } finally {
      setIsPending(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-24 flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        Carregando artigo…
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/blog')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold">{postId ? 'Editar artigo' : 'Novo Artigo'}</h1>
            <p className="text-sm text-muted-foreground">
              Conteúdo em <strong className="font-medium text-foreground">Markdown</strong>; imagem principal opcional.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSubmit(false)} disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar Rascunho
          </Button>
          <Button onClick={() => handleSubmit(true)} disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
            Publicar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input
              placeholder="Digite o título do artigo"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="text-lg"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground text-right">{formData.title.length}/200</p>
          </div>

          <div className="space-y-2">
            <Label>Slug (URL) *</Label>
            <div className="flex gap-2">
              <Input
                placeholder="url-do-artigo"
                value={formData.slug}
                onChange={(e) => {
                  setAutoSlug(false);
                  setFormData((prev) => ({ ...prev, slug: e.target.value }));
                }}
              />
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => {
                  setAutoSlug(true);
                  setFormData((prev) => ({ ...prev, slug: generateSlug(prev.title) }));
                }}
              >
                Auto
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">/blog/{formData.slug || 'url-do-artigo'}</p>
          </div>

          <div className="rounded-xl border bg-card p-4 space-y-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-heading font-semibold">Imagem principal</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Usada na listagem do blog e como capa do artigo. Envie JPG ou PNG (recomendado 1200×630px).
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploadingImage}
                className="relative w-full sm:w-48 aspect-[1200/630] max-h-40 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center overflow-hidden bg-muted/50"
              >
                {uploadingImage ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : formData.featured_image ? (
                  <img src={formData.featured_image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="h-8 w-8 text-muted-foreground" />
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFeaturedUpload}
              />
              <div className="flex-1 space-y-2">
                <Label htmlFor="featured_image_alt">Texto alternativo da imagem (acessibilidade / SEO)</Label>
                <Textarea
                  id="featured_image_alt"
                  placeholder="Descreva a imagem para leitores de tela e buscadores"
                  value={formData.featured_image_alt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, featured_image_alt: e.target.value }))}
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">{formData.featured_image_alt.length}/500</p>
                {formData.featured_image && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setFormData((p) => ({ ...p, featured_image: '' }))}>
                    Remover imagem
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Resumo</Label>
            <Textarea
              placeholder="Breve descrição do artigo"
              value={formData.excerpt}
              onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
              rows={3}
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground text-right">{formData.excerpt.length}/300</p>
          </div>

          <div className="space-y-2">
            <Label>Conteúdo (Markdown) *</Label>
            <Tabs defaultValue="write" className="w-full">
              <TabsList className="mb-2">
                <TabsTrigger value="write" className="gap-2">
                  <Pencil className="h-4 w-4" />
                  Escrever
                </TabsTrigger>
                <TabsTrigger value="preview" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Visualizar
                </TabsTrigger>
              </TabsList>
              <TabsContent value="write">
                <Textarea
                  placeholder="Use Markdown: ## Títulos, **negrito**, listas, links [texto](url), imagens ![alt](url)…"
                  value={formData.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  rows={20}
                  className="font-mono text-sm"
                />
              </TabsContent>
              <TabsContent value="preview">
                <div className="min-h-[480px] rounded-lg border bg-card p-6 overflow-auto">
                  {formData.content ? (
                    <article className="prose prose-neutral dark:prose-invert max-w-none">
                      <ReactMarkdown>{formData.content}</ReactMarkdown>
                    </article>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">Nenhum conteúdo</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            <p className="text-xs text-muted-foreground">Leitura estimada: {formData.reading_time_minutes} min</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-4 rounded-lg border bg-card space-y-4">
            <h3 className="font-heading font-semibold">Status</h3>
            <Select
              value={formData.status}
              onValueChange={(v) => setFormData((prev) => ({ ...prev, status: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 rounded-lg border bg-card space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-heading font-semibold">Categoria</h3>
              <Button type="button" variant="outline" size="sm" onClick={openNewCategoryDialog}>
                Nova categoria
              </Button>
            </div>
            <Select
              value={formData.category_id || '__none__'}
              onValueChange={(v) =>
                setFormData((prev) => ({ ...prev, category_id: v === '__none__' ? '' : v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Nenhuma</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      {c.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog
            open={categoryDialogOpen}
            onOpenChange={(open) => {
              setCategoryDialogOpen(open);
              if (!open) resetNewCategoryForm();
            }}
          >
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Nova categoria</DialogTitle>
                <DialogDescription>
                  O slug é gerado a partir do nome. Você pode ajustá-lo manualmente se precisar.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="new-cat-name">Nome</Label>
                  <Input
                    id="new-cat-name"
                    placeholder="Ex.: Mercado"
                    value={newCatName}
                    onChange={(e) => handleNewCatNameChange(e.target.value)}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-cat-slug">Slug (opcional)</Label>
                  <Input
                    id="new-cat-slug"
                    className="font-mono text-sm"
                    placeholder="mercado"
                    value={newCatSlug}
                    onChange={(e) => {
                      setCatSlugManual(true);
                      setNewCatSlug(e.target.value);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-cat-color">Cor no blog</Label>
                  <div className="flex items-center gap-3">
                    <input
                      id="new-cat-color"
                      type="color"
                      className="h-9 w-14 cursor-pointer rounded border border-input bg-background p-1"
                      value={newCatColor}
                      onChange={(e) => setNewCatColor(e.target.value)}
                    />
                    <span className="text-sm text-muted-foreground font-mono">{newCatColor}</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setCategoryDialogOpen(false);
                    resetNewCategoryForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="button" onClick={() => void handleCreateCategory()} disabled={savingCategory}>
                  {savingCategory ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando…
                    </>
                  ) : (
                    'Criar'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="p-4 rounded-lg border bg-card space-y-4">
            <h3 className="font-heading font-semibold">SEO</h3>
            <div className="space-y-2">
              <Label>Meta Title</Label>
              <Input
                placeholder="Título SEO"
                value={formData.meta_title}
                onChange={(e) => setFormData((prev) => ({ ...prev, meta_title: e.target.value }))}
                maxLength={70}
              />
            </div>
            <div className="space-y-2">
              <Label>Meta Description</Label>
              <Textarea
                placeholder="Descrição SEO"
                value={formData.meta_description}
                onChange={(e) => setFormData((prev) => ({ ...prev, meta_description: e.target.value }))}
                rows={3}
                maxLength={160}
              />
            </div>
            <div className="space-y-2">
              <Label>Keywords</Label>
              <Input
                placeholder="palavra1, palavra2"
                value={formData.meta_keywords}
                onChange={(e) => setFormData((prev) => ({ ...prev, meta_keywords: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
