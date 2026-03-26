import { Metadata } from 'next';
import { DealerClient } from './DealerClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  const title = `${slug.replace(/-/g, ' ')} | Veículos | Kairós Auto`;
  
  return {
    title,
    description: `Veja os veículos em estoque de ${slug.replace(/-/g, ' ')} na Kairós Auto.`,
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  
  return <DealerClient slug={slug} />;
}
