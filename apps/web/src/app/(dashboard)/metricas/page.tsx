import { Metadata } from 'next';
import { MetricsClient } from './MetricsClient';

export const metadata: Metadata = {
  title: 'Métricas | Seu Novo Carro',
  description: 'Visualize as métricas e performance dos seus anúncios.',
};

export default function Page() {
  return <MetricsClient />;
}
