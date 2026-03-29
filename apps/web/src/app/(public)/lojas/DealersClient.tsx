"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Store, BadgeCheck, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useDealers, useFeaturedDealers, Dealer } from '@/hooks/useDealers';
import { cn } from '@/lib/utils';

export function DealersClient() {
  const { data: dealers, isLoading } = useDealers();
  const { data: featuredDealers } = useFeaturedDealers();

  return (
    <div className="min-h-screen py-8 pb-24 md:pb-8 pt-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg gradient-brand">
              <Store className="h-6 w-6 text-white" />
            </div>
            <h1 className="font-heading text-3xl font-bold">
              Lojas <span className="gradient-brand-text">Parceiras</span>
            </h1>
          </div>
          <p className="text-muted-foreground">
            Lojistas verificados e aprovados pela Seu Novo Carro
          </p>
        </motion.div>

        {featuredDealers && featuredDealers.length > 0 && (
          <section className="mb-12">
            <h2 className="font-heading text-xl font-semibold mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Lojas em Destaque
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDealers.map((dealer, i) => (
                <motion.div
                  key={dealer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <DealerCard dealer={dealer} featured />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="font-heading text-xl font-semibold mb-4">
            Todas as Lojas
          </h2>
          
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-48 rounded-2xl" />
              ))}
            </div>
          ) : dealers && dealers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {dealers.map((dealer, i) => (
                <motion.div
                  key={dealer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <DealerCard dealer={dealer} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-2xl">
              <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhuma loja parceira cadastrada ainda.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function DealerCard({ dealer, featured = false }: { dealer: Dealer; featured?: boolean }) {
  return (
    <Link
      href={`/loja/${dealer.dealer_slug}`}
      className={cn(
        "group block bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all",
        featured && "ring-2 ring-primary"
      )}
    >
      <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/5 relative">
        {dealer.dealer_banner && (
          <img
            src={dealer.dealer_banner}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
        {featured && (
          <Badge className="absolute top-2 right-2 bg-yellow-500 text-yellow-950 border-0">
            <Star className="h-3 w-3 mr-1" />
            Destaque
          </Badge>
        )}
        {dealer.dealer_verified && (
          <Badge className="absolute top-2 left-2 gradient-brand text-white border-0">
            <BadgeCheck className="h-3 w-3 mr-1" />
            Verificado
          </Badge>
        )}
      </div>

      <div className="p-4 relative">
        <div className="absolute -top-8 left-4 w-16 h-16 rounded-xl bg-white shadow-lg overflow-hidden border-2 border-background">
          {dealer.dealer_logo ? (
            <img 
              src={dealer.dealer_logo} 
              alt="" 
              className="w-full h-full object-contain p-1" 
            />
          ) : (
            <div className="w-full h-full gradient-brand flex items-center justify-center text-white font-bold text-xl">
              {dealer.dealer_name.charAt(0)}
            </div>
          )}
        </div>

        <div className="pt-6">
          <h3 className="font-heading font-semibold group-hover:text-primary transition-colors line-clamp-1">
            {dealer.dealer_name}
          </h3>
          {dealer.city && dealer.state && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {dealer.city}, {dealer.state}
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            {dealer.vehicle_count || 0} veículos
          </p>
        </div>
      </div>
    </Link>
  );
}
