"use client";

import Link from 'next/link';
import { Calendar, Clock, ArrowLeft, Eye, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ArticleSchema } from '@/components/seo/schemas/ArticleSchema';
import { useBlogPost, useRelatedPosts } from '@/hooks/useBlog';
import ReactMarkdown from 'react-markdown';

export function BlogPostClient({ slug }: { slug: string }) {
  const { data: post, isLoading } = useBlogPost(slug);
  const { data: relatedPosts } = useRelatedPosts(slug);

  if (isLoading && !post) {
    return (
      <div className="container py-8 md:py-12 max-w-4xl pt-24">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-6 w-2/3 mb-8" />
        <Skeleton className="aspect-video w-full rounded-2xl mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!isLoading && !post) {
    return (
      <div className="container py-16 text-center pt-32">
        <div className="p-4 rounded-full bg-muted inline-block mb-4">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="font-heading text-2xl font-bold mb-4">Artigo não encontrado</h1>
        <p className="text-muted-foreground mb-6">O artigo que você procura não existe ou foi removido.</p>
        <Button asChild>
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao blog
          </Link>
        </Button>
      </div>
    );
  }

  const shareUrl = `https://kairosauto.com.br/blog/${post.slug}`;
  const breadcrumbItems = [
    { label: 'Início', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: post.title }
  ];

  return (
    <article className="min-h-screen bg-background pt-16">
      <ArticleSchema
        title={post.title}
        description={post.excerpt || ''}
        image={post.featured_image || undefined}
        datePublished={post.published_at || post.created_at}
        dateModified={post.updated_at}
        authorName={post.author?.full_name || 'Kairós Auto'}
        url={shareUrl}
      />
      
      <div className="container py-8 md:py-12 max-w-4xl">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="mt-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao blog
            </Link>
          </Button>
        </div>

        <header className="mb-8">
          {post.category && (
            <Badge 
              variant="secondary" 
              className="mb-4"
              style={{ backgroundColor: `${post.category.color}20`, color: post.category.color }}
            >
              {post.category.name}
            </Badge>
          )}
          
          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            {post.title}
          </h1>
          
          {post.excerpt && (
            <p className="text-xl text-muted-foreground mb-6">
              {post.excerpt}
            </p>
          )}
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {post.author?.full_name && (
              <span className="font-medium text-foreground">
                {post.author.full_name}
              </span>
            )}
            {post.published_at && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(post.published_at).toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.reading_time_minutes} min de leitura
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {post.views_count} visualizações
            </span>
          </div>
        </header>

        {post.featured_image && (
          <figure className="mb-8">
            <img
              src={post.featured_image}
              alt={post.featured_image_alt || post.title}
              className="w-full rounded-2xl object-cover aspect-video"
            />
            {post.featured_image_alt && (
              <figcaption className="text-sm text-muted-foreground text-center mt-2">
                {post.featured_image_alt}
              </figcaption>
            )}
          </figure>
        )}

        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          {/* @ts-ignore */}
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        <div className="border-t pt-8 mb-12">
          <p className="font-heading font-semibold mb-4">Compartilhe este artigo:</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <a 
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a 
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Twitter
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a 
                href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a 
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + ' ' + shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </Button>
          </div>
        </div>

        {relatedPosts && relatedPosts.length > 0 && (
          <section className="border-t pt-8">
            <h2 className="font-heading text-2xl font-bold mb-6">
              Artigos relacionados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedPosts.map((relatedPost: any) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="group flex gap-4 p-4 rounded-xl border hover:bg-muted/50 transition-colors"
                >
                  {relatedPost.featured_image ? (
                    <img
                      src={relatedPost.featured_image}
                      alt={relatedPost.title}
                      className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-lg gradient-kairos-soft flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-6 w-6 text-primary/50" />
                    </div>
                  )}
                  <div className="flex flex-col justify-center min-w-0">
                    <h3 className="font-heading font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                      {relatedPost.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {relatedPost.reading_time_minutes} min de leitura
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-12 p-8 rounded-2xl gradient-kairos text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">
            Procurando um carro?
          </h2>
          <p className="text-white/80 mb-6">
            Confira os veículos disponíveis na Kairós Auto
          </p>
          <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg" asChild>
            <Link href="/veiculos">Ver veículos</Link>
          </Button>
        </section>
      </div>
    </article>
  );
}
