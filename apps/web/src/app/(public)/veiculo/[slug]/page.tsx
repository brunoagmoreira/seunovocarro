import { Metadata } from 'next';
import { VehicleClient } from './VehicleClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  // A Server-side fetch to get basic data for SEO could be implemented here.
  // For now we return generic metadata, but it will dynamically render the slug.
  const title = `Detalhes do Veículo - ${slug.replace(/-/g, ' ')}`;
  
  return {
    title,
    description: "Confira todos os detalhes, fotos e especificações deste veículo incrível na Kairós Auto.",
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  
  return <VehicleClient slug={slug} />;
}
