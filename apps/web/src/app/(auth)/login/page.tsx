import { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginClient } from './LoginClient';

export const metadata: Metadata = {
  title: 'Entrar | Seu Novo Carro',
  description: 'Acesse sua conta na Seu Novo Carro para gerenciar seus anúncios.',
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-20 flex items-center justify-center">Carregando login...</div>}>
      <LoginClient />
    </Suspense>
  );
}
