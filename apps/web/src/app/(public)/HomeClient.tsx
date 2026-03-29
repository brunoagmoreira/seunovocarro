"use client";

import { useState, lazy, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Car, Shield, Users, HelpCircle, BookOpen, Calendar, Store, MapPin, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VehicleCard } from '@/components/vehicles/VehicleCard';
import { SearchFilters } from '@/components/vehicles/SearchFilters';

// Components
import { BuyerBanners } from '@/components/home/BuyerBanners';
import { TrustBadges } from '@/components/home/TrustBadges';

import { useFeaturedVehicles, useVehicleCount } from '@/hooks/useVehicles';
import { useBlogPosts } from '@/hooks/useBlog';
import { useFeaturedDealers } from '@/hooks/useDealers';
import { useUTM } from '@/hooks/useUTM';
import { VehicleFilters } from '@/types/vehicle';
import { Skeleton } from '@/components/ui/skeleton';
import { OrganizationSchema, WebsiteSearchSchema, LocalBusinessSchema } from '@/components/seo/schemas';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FEATURED_FAQS } from '@/data/faqContent';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function HomeClient() {
  const router = useRouter();
  const [filters, setFilters] = useState<VehicleFilters>({});
  
  const { data: featuredVehicles, isLoading } = useFeaturedVehicles();
  const { data: vehicleCount = 0 } = useVehicleCount();
  const { data: recentPosts, isLoading: isLoadingPosts } = useBlogPosts();
  const { data: featuredDealers, isLoading: isLoadingDealers } = useFeaturedDealers();
  
  // Capture UTM params on page load
  useUTM();

  const handleSearch = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, String(value));
    });
    router.push(`/veiculos?${params.toString()}`);
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Schemas handled client-side or moving to server-side metadata later. We keep them here for now */}
      <OrganizationSchema />
      <WebsiteSearchSchema />
      <LocalBusinessSchema />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-brand opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        
        <div className="container relative pt-8 pb-12 md:pt-16 md:pb-20">
          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12 animate-fade-in">
            <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Encontre seu{' '}
              <span className="gradient-brand-text">carro ideal</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl mb-6">
              Os melhores veículos seminovos e usados, selecionados para você
            </p>
            
            <div className="flex justify-center gap-8 md:gap-12">
              <div className="text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <span className="text-2xl md:text-3xl font-bold gradient-brand-text">{vehicleCount}</span>
                <p className="text-xs md:text-sm text-muted-foreground">veículos disponíveis</p>
              </div>
              <div className="text-center animate-fade-in" style={{ animationDelay: '0.15s' }}>
                <span className="text-2xl md:text-3xl font-bold gradient-brand-text">500+</span>
                <p className="text-xs md:text-sm text-muted-foreground">carros vendidos</p>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <SearchFilters 
              filters={filters}
              onFilterChange={setFilters}
              onSearch={handleSearch}
              variant="hero"
            />
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 border-y border-border bg-card/50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: Car,
                title: 'Veículos verificados',
                description: 'Todos os anúncios passam por aprovação da nossa equipe'
              },
              {
                icon: Shield,
                title: 'Compra segura',
                description: 'Contato direto com vendedores verificados'
              },
              {
                icon: Users,
                title: 'Multi-vendedor',
                description: 'Diversos vendedores em um só lugar'
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="flex items-start gap-4"
              >
                <div className="p-3 rounded-xl gradient-brand-soft">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BuyerBanners />

      <section className="py-12 md:py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold mb-1">
                Veículos em destaque
              </h2>
              <p className="text-muted-foreground">
                Selecionados especialmente para você
              </p>
            </div>
            <Button variant="ghost" asChild className="hidden md:flex">
              <Link href="/veiculos">
                Ver todos
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden bg-card">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-6 w-1/3" />
                  </div>
                </div>
              ))
            ) : featuredVehicles && featuredVehicles.length > 0 ? (
              featuredVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle as any} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">Nenhum veículo disponível no momento.</p>
                <Button variant="outline" asChild className="mt-4">
                  <Link href="/anunciar">Seja o primeiro a anunciar</Link>
                </Button>
              </div>
            )}
          </div>

          <div className="mt-6 md:hidden">
            <Button variant="outline" asChild className="w-full">
              <Link href="/veiculos">
                Ver todos os veículos
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <TrustBadges />

      {(isLoadingPosts || (recentPosts && recentPosts.length > 0)) && (
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
              {isLoadingPosts ? (
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
                        />
                      ) : (
                        <div className="aspect-video w-full bg-muted flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          {/* @ts-ignore */}
                          {post.category && (
                            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                              {/* @ts-ignore */}
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
      )}

      {(isLoadingDealers || (featuredDealers && featuredDealers.length > 0)) && (
        <section className="py-12 md:py-16">
          <div className="container">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg gradient-brand">
                  <Store className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="font-heading text-2xl md:text-3xl font-bold">
                    Lojas Parceiras
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Lojistas verificados pela Seu Novo Carro
                  </p>
                </div>
              </div>
              <Button variant="ghost" asChild className="hidden md:flex">
                <Link href="/lojas">
                  Ver todas
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingDealers ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-2xl" />
                ))
              ) : (
                featuredDealers?.map((dealer) => (
                  <Link
                    key={dealer.id}
                    href={`/loja/${dealer.dealer_slug}`}
                    className="group block bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all"
                  >
                    <div className="h-20 bg-gradient-to-r from-primary/20 to-primary/5 relative">
                      {dealer.dealer_banner && (
                        <img
                          src={dealer.dealer_banner}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      )}
                      {dealer.dealer_verified && (
                        <div className="absolute top-2 right-2 bg-primary/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <BadgeCheck className="h-3 w-3" />
                          Verificado
                        </div>
                      )}
                    </div>
                    <div className="p-4 relative">
                      <div className="absolute -top-8 left-4 w-14 h-14 rounded-xl bg-white shadow-lg overflow-hidden border-2 border-background">
                        {dealer.dealer_logo ? (
                          <img src={dealer.dealer_logo} alt="" className="w-full h-full object-contain p-1" loading="lazy" />
                        ) : (
                          <div className="w-full h-full gradient-brand flex items-center justify-center text-white font-bold text-lg">
                            {dealer.dealer_name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="pt-4">
                        <h3 className="font-heading font-semibold group-hover:text-primary transition-colors line-clamp-1">
                          {dealer.dealer_name}
                        </h3>
                        {dealer.city && dealer.state && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {dealer.city}, {dealer.state}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            <div className="mt-6 md:hidden">
              <Button variant="outline" asChild className="w-full">
                <Link href="/lojas">
                  Ver todas as lojas
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold">
                  Perguntas Frequentes
                </h2>
                <p className="text-muted-foreground text-sm">
                  Tire suas dúvidas sobre a Seu Novo Carro
                </p>
              </div>
            </div>
            <Button variant="ghost" asChild className="hidden md:flex">
              <Link href="/perguntas-frequentes">
                Ver todas
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="max-w-3xl">
            <Accordion type="single" collapsible className="space-y-3">
              {FEATURED_FAQS.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`faq-${index}`}
                  className="bg-card border rounded-lg px-4"
                >
                  <AccordionTrigger className="text-left font-medium hover:no-underline py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="mt-6 md:hidden">
            <Button variant="outline" asChild className="w-full">
              <Link href="/perguntas-frequentes">
                Ver todas as perguntas
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl gradient-brand p-8 md:p-12 text-center">
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="font-heading text-2xl md:text-4xl font-bold text-white mb-4">
                Quer vender seu carro?
              </h2>
              <p className="text-white/80 mb-6 md:mb-8">
                Anuncie gratuitamente e alcance milhares de compradores
              </p>
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90"
                asChild
              >
                <Link href="/anunciar">
                  Anunciar agora
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </div>
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>
        </div>
      </section>
    </div>
  );
}
