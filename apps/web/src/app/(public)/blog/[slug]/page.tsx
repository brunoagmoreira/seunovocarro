import { Metadata } from 'next';
import { BlogPostClient } from './BlogPostClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  // Convert basic slug into title proxy for SSR static initial loads.
  const title = `${slug.replace(/-/g, ' ')} | Blog Kairós Auto`;
  
  return {
    title,
    description: `Leia o artigo sobre ${slug.replace(/-/g, ' ')} no Blog da Kairós Auto.`,
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  
  return <BlogPostClient slug={slug} />;
}
