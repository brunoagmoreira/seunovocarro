import { Metadata } from 'next';
import { Suspense } from 'react';
import { HomeClient } from './HomeClient';
import { ClientLayout } from '@/components/layout/Layout';

export const metadata: Metadata = {
  title: "Carros Seminovos e Usados | Compre ou Venda",
  description: "Encontre os melhores carros seminovos e usados no Kairós Auto. Vendedores verificados, compra segura e sem taxas escondidas. Anuncie grátis!",
  keywords: ['carros usados', 'seminovos', 'comprar carro', 'vender carro', 'marketplace carros', 'veículos usados'],
  alternates: {
    canonical: '/'
  }
};

export default function Page() {
  return (
    <ClientLayout>
      <Suspense fallback={<div className="min-h-screen pt-20 flex items-center justify-center text-muted-foreground">Carregando portal...</div>}>
        <HomeClient />
      </Suspense>
    </ClientLayout>
  );
}
