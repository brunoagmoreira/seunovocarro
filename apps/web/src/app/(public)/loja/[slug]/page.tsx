import { Metadata } from 'next';
import { DealerClient } from './DealerClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  const title = `${slug.replace(/-/g, ' ')} | Veículos | Seu Novo Carro`;
  
  return {
    title,
    description: `Veja os veículos em estoque de ${slug.replace(/-/g, ' ')} na Seu Novo Carro.`,
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  
  return <DealerClient slug={slug} />;
}
