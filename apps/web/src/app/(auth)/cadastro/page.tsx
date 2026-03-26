import { Metadata } from 'next';
import { RegisterClient } from './RegisterClient';

export const metadata: Metadata = {
  title: 'Criar Conta | Kairós Auto',
  description: 'Cadastre-se para comprar ou vender veículos na Kairós Auto.',
};

export default function Page() {
  return <RegisterClient />;
}
