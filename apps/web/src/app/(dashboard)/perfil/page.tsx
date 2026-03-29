import { Metadata } from 'next';
import { Suspense } from 'react';
import { ProfileClient } from './ProfileClient';

export const metadata: Metadata = {
  title: 'Meu Perfil | Seu Novo Carro',
  description: 'Gerencie suas informações de conta da Seu Novo Carro.',
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-20 flex items-center justify-center text-muted-foreground">Carregando perfil...</div>}>
      <ProfileClient />
    </Suspense>
  );
}
