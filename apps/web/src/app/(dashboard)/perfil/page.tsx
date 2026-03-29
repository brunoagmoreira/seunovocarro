import { Metadata } from 'next';
import { Suspense } from 'react';
import { ProfileClient } from './ProfileClient';

export const metadata: Metadata = {
  title: 'Meu Perfil | Kairós Auto',
  description: 'Gerencie suas informações de conta da Kairós Auto.',
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-20 flex items-center justify-center text-muted-foreground">Carregando perfil...</div>}>
      <ProfileClient />
    </Suspense>
  );
}
