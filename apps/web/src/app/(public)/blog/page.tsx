import { Metadata } from 'next';
import { BlogClient } from './BlogClient';

export const metadata: Metadata = {
  title: "Blog | Dicas e Guias sobre Carros | Seu Novo Carro",
  description: "Confira dicas, guias de compra, comparativos e tudo que você precisa saber sobre carros usados e seminovos no blog da Seu Novo Carro.",
  keywords: ['blog carros', 'dicas carros usados', 'guia compra carro', 'comparativo carros'],
};

export default function Page() {
  return <BlogClient />;
}
