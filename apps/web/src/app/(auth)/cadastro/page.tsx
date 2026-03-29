import { Metadata } from 'next';
import { RegisterClient } from './RegisterClient';

export const metadata: Metadata = {
  title: 'Criar Conta | Seu Novo Carro',
  description: 'Cadastre-se para comprar ou vender veículos na Seu Novo Carro.',
};

export default function Page() {
  return <RegisterClient />;
}
