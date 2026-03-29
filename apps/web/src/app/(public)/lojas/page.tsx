import { Metadata } from 'next';
import { DealersClient } from './DealersClient';

export const metadata: Metadata = {
  title: "Lojas Parceiras | Lojistas Verificados | Seu Novo Carro",
  description: "Conheça os lojistas parceiros da Seu Novo Carro. Lojas verificadas com os melhores carros usados e seminovos do Brasil.",
  keywords: ['lojas carros usados', 'concessionárias parceiras', 'lojistas verificados', 'revendedoras'],
};

export default function Page() {
  return <DealersClient />;
}
