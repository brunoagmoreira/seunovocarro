import { Metadata } from 'next';
import { DealersClient } from './DealersClient';

export const metadata: Metadata = {
  title: "Lojas Parceiras | Lojistas Verificados | Kairós Auto",
  description: "Conheça os lojistas parceiros da Kairós Auto. Lojas verificadas com os melhores carros usados e seminovos do Brasil.",
  keywords: ['lojas carros usados', 'concessionárias parceiras', 'lojistas verificados', 'revendedoras'],
};

export default function Page() {
  return <DealersClient />;
}
