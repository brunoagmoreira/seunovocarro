import { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginClient } from './LoginClient';

export const metadata: Metadata = {
  title: 'Entrar | Kairós Auto',
  description: 'Acesse sua conta na Kairós Auto para gerenciar seus anúncios.',
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-20 flex items-center justify-center">Carregando login...</div>}>
      <LoginClient />
    </Suspense>
  );
}
