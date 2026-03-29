import { Metadata } from 'next';
import { Suspense } from 'react';
import { VehicleClient } from './VehicleClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  const title = `Detalhes do Veículo - ${slug.replace(/-/g, ' ')}`;
  
  return {
    title,
    description: "Confira todos os detalhes, fotos e especificações deste veículo incrível na Kairós Auto.",
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  
  return (
    <Suspense fallback={<div className="min-h-screen pt-20 flex items-center justify-center text-muted-foreground">Carregando detalhes do veículo...</div>}>
      <VehicleClient slug={slug} />
    </Suspense>
  );
}
