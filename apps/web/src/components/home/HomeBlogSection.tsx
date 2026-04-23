"use client";

import Link from 'next/link';
import { ArrowRight, BookOpen, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useBlogPosts } from '@/hooks/useBlog';

export function HomeBlogSection() {
  const { data: recentPosts, isLoading } = useBlogPosts();

  if (!isLoading && (!recentPosts || recentPosts.length === 0)) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold">
                Últimos do Blog
              </h2>
              <p className="text-muted-foreground text-sm">
                Dicas e novidades do mundo automotivo
              </p>
            </div>
          </div>
          <Button variant="ghost" asChild className="hidden md:flex">
            <Link href="/blog">
              Ver todos
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl overflow-hidden border">
                <Skeleton className="aspect-video w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))
          ) : (
            recentPosts?.map((post) => (
              <article
                key={post.id}
                className="group bg-card rounded-xl overflow-hidden border hover:shadow-lg transition-shadow"
              >
                <Link href={`/blog/${post.slug}`}>
                  {post.featured_image ? (
                    <img
                      src={post.featured_image}
                      alt={post.featured_image_alt || post.title}
                      className="aspect-video w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="aspect-video w-full bg-muted flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      {post.category && (
                        <span className="px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                          {post.category.name}
                        </span>
                      )}
                      {post.published_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(post.published_at), "d 'de' MMM", { locale: ptBR })}
                        </span>
                      )}
                    </div>
                    <h3 className="font-heading font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              </article>
            ))
          )}
        </div>

        <div className="mt-6 md:hidden">
          <Button variant="outline" asChild className="w-full">
            <Link href="/blog">
              Ver todos os artigos
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
