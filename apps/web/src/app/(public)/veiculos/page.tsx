import { Metadata } from 'next';
import { VehiclesClient } from './VehiclesClient';

export const metadata: Metadata = {
  title: "Veículos Disponíveis",
  description: "Encontre os melhores carros seminovos e usados na Kairós Auto com garantias e histórico limpo.",
};

import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-20 flex items-center justify-center">Carregando estoque...</div>}>
      <VehiclesClient />
    </Suspense>
  );
}
