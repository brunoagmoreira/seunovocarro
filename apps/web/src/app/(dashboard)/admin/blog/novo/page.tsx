"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye, Loader2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

const generateSlug = (title: string) => title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const calculateReadingTime = (content: string) => Math.max(1, Math.ceil(content.split(/\s+/).length / 200));

const categories = [
  { id: '1', name: 'Dicas', color: '#22c55e' },
  { id: '2', name: 'Financiamento', color: '#3b82f6' },
  { id: '3', name: 'Rankings', color: '#a855f7' },
  { id: '4', name: 'Manutenção', color: '#f59e0b' },
  { id: '5', name: 'Tecnologia', color: '#06b6d4' },
];

export default function BlogEditorPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);
  const [formData, setFormData] = useState({
    title: '', slug: '', excerpt: '', content: '', featured_image: '',
    category_id: '', status: 'draft', meta_title: '', meta_description: '',
    meta_keywords: '', reading_time_minutes: 5,
  });

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({ ...prev, title, slug: autoSlug ? generateSlug(title) : prev.slug }));
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content, reading_time_minutes: calculateReadingTime(content) }));
  };

  const handleSubmit = (publishNow = false) => {
    if (!formData.title.trim()) { toast.error('Título é obrigatório'); return; }
    if (!formData.content.trim()) { toast.error('Conteúdo é obrigatório'); return; }
    setIsPending(true);
    setTimeout(() => {
      setIsPending(false);
      toast.success(publishNow ? 'Artigo publicado!' : 'Rascunho salvo!');
      router.push('/admin/blog');
    }, 1000);
  };

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/blog')}><ArrowLeft className="h-5 w-5" /></Button>
          <div><h1 className="font-heading text-2xl font-bold">Novo Artigo</h1><p className="text-sm text-muted-foreground">Crie um novo artigo para o blog</p></div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSubmit(false)} disabled={isPending}>{isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Salvar Rascunho</Button>
          <Button onClick={() => handleSubmit(true)} disabled={isPending}>{isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}Publicar</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2"><Label>Título *</Label><Input placeholder="Digite o título do artigo" value={formData.title} onChange={(e) => handleTitleChange(e.target.value)} className="text-lg" maxLength={200} /><p className="text-xs text-muted-foreground text-right">{formData.title.length}/200</p></div>
          <div className="space-y-2"><Label>Slug (URL) *</Label><div className="flex gap-2"><Input placeholder="url-do-artigo" value={formData.slug} onChange={(e) => { setAutoSlug(false); setFormData(prev => ({ ...prev, slug: e.target.value })); }} /><Button variant="outline" size="sm" onClick={() => { setAutoSlug(true); setFormData(prev => ({ ...prev, slug: generateSlug(prev.title) })); }}>Auto</Button></div><p className="text-xs text-muted-foreground">/blog/{formData.slug || 'url-do-artigo'}</p></div>
          <div className="space-y-2"><Label>Resumo</Label><Textarea placeholder="Breve descrição do artigo" value={formData.excerpt} onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))} rows={3} maxLength={300} /><p className="text-xs text-muted-foreground text-right">{formData.excerpt.length}/300</p></div>
          <div className="space-y-2">
            <Label>Conteúdo (Markdown) *</Label>
            <Tabs defaultValue="write" className="w-full">
              <TabsList className="mb-2"><TabsTrigger value="write" className="gap-2"><Pencil className="h-4 w-4" />Escrever</TabsTrigger><TabsTrigger value="preview" className="gap-2"><Eye className="h-4 w-4" />Visualizar</TabsTrigger></TabsList>
              <TabsContent value="write"><Textarea placeholder="Escreva em Markdown..." value={formData.content} onChange={(e) => handleContentChange(e.target.value)} rows={20} className="font-mono text-sm" /></TabsContent>
              <TabsContent value="preview"><div className="min-h-[480px] rounded-lg border bg-card p-6 overflow-auto">{formData.content ? <article className="prose prose-neutral dark:prose-invert max-w-none"><ReactMarkdown>{formData.content}</ReactMarkdown></article> : <p className="text-muted-foreground text-center py-8">Nenhum conteúdo</p>}</div></TabsContent>
            </Tabs>
            <p className="text-xs text-muted-foreground">Leitura estimada: {formData.reading_time_minutes} min</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-4 rounded-lg border bg-card space-y-4"><h3 className="font-heading font-semibold">Status</h3><Select value={formData.status} onValueChange={(v) => setFormData(prev => ({...prev, status: v}))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Rascunho</SelectItem><SelectItem value="published">Publicado</SelectItem><SelectItem value="archived">Arquivado</SelectItem></SelectContent></Select></div>
          <div className="p-4 rounded-lg border bg-card space-y-4"><h3 className="font-heading font-semibold">Categoria</h3><Select value={formData.category_id} onValueChange={(v) => setFormData(prev => ({...prev, category_id: v}))}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{categories.map(c => (<SelectItem key={c.id} value={c.id}><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{backgroundColor: c.color}} />{c.name}</span></SelectItem>))}</SelectContent></Select></div>
          <div className="p-4 rounded-lg border bg-card space-y-4"><h3 className="font-heading font-semibold">SEO</h3><div className="space-y-2"><Label>Meta Title</Label><Input placeholder="Título SEO" value={formData.meta_title} onChange={(e) => setFormData(prev => ({...prev, meta_title: e.target.value}))} maxLength={70} /></div><div className="space-y-2"><Label>Meta Description</Label><Textarea placeholder="Descrição SEO" value={formData.meta_description} onChange={(e) => setFormData(prev => ({...prev, meta_description: e.target.value}))} rows={3} maxLength={160} /></div><div className="space-y-2"><Label>Keywords</Label><Input placeholder="palavra1, palavra2" value={formData.meta_keywords} onChange={(e) => setFormData(prev => ({...prev, meta_keywords: e.target.value}))} /></div></div>
        </div>
      </div>
    </div>
  );
}
