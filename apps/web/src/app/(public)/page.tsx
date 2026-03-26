import { Metadata } from 'next';
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
      <HomeClient />
    </ClientLayout>
  );
}
