"use client";

import Link from 'next/link';
import { ArrowRight, BadgeCheck, MapPin, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useFeaturedDealers } from '@/hooks/useDealers';

export function HomeDealersSection() {
  const { data: featuredDealers, isLoading, isError, refetch } = useFeaturedDealers();

  const showEmpty =
    !isLoading &&
    !isError &&
    (!featuredDealers || featuredDealers.length === 0);

  return (
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
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))
          ) : isError ? (
            <div className="col-span-full rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
              <p className="mb-2 font-medium text-foreground">Não foi possível carregar as lojas</p>
              <p className="text-sm text-muted-foreground mb-4">
                Tente de novo em instantes. Se persistir, confira os logs da API e as migrações do banco de dados.
              </p>
              <Button type="button" variant="outline" onClick={() => void refetch()}>
                Tentar novamente
              </Button>
            </div>
          ) : showEmpty ? (
            <div className="col-span-full rounded-2xl border border-dashed bg-muted/30 px-6 py-10 text-center text-muted-foreground">
              <p className="mb-2 font-medium text-foreground">Nenhuma loja listada no momento</p>
              <p className="text-sm mb-4">
                Assim que houver lojistas cadastrados, eles aparecerão aqui. Enquanto isso, confira a
                página de lojas.
              </p>
              <Button variant="outline" asChild>
                <Link href="/lojas">
                  Ver página de lojas
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          ) : (
            featuredDealers?.map((dealer) => (
              <Link
                key={dealer.id}
                href={`/loja/${dealer.dealer_slug || dealer.slug}`}
                className="group block bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all"
              >
                <div className="relative h-24 w-full overflow-hidden bg-gradient-to-r from-primary/20 to-primary/5">
                  {(dealer.dealer_banner || dealer.banner_url) ? (
                    <img
                      src={dealer.dealer_banner || dealer.banner_url || ''}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}
                  {(dealer.dealer_verified || dealer.verified) && (
                    <div className="absolute top-2 right-2 z-10 bg-primary/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <BadgeCheck className="h-3 w-3" />
                      Verificado
                    </div>
                  )}
                </div>
                <div className="p-4 relative">
                  <div className="absolute -top-8 left-4 size-14 shrink-0 rounded-full bg-background shadow-md ring-1 ring-border/40 overflow-hidden">
                    {(dealer.dealer_logo || dealer.logo_url) ? (
                      <img
                        src={dealer.dealer_logo || dealer.logo_url || ''}
                        alt=""
                        className="h-full w-full rounded-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="w-full h-full gradient-brand flex items-center justify-center text-white font-bold text-lg">
                        {(dealer.dealer_name || dealer.name || 'L').charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="pt-4">
                    <h3 className="font-heading font-semibold group-hover:text-primary transition-colors line-clamp-1">
                      {dealer.dealer_name || dealer.name}
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
  );
}
