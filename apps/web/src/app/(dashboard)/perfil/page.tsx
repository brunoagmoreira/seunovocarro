import { Metadata } from 'next';
import { ProfileClient } from './ProfileClient';

export const metadata: Metadata = {
  title: 'Meu Perfil | Kairós Auto',
  description: 'Gerencie suas informações de conta da Kairós Auto.',
};

export default function Page() {
  return <ProfileClient />;
}
