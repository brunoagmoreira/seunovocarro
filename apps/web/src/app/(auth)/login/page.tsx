import { Metadata } from 'next';
import { LoginClient } from './LoginClient';

export const metadata: Metadata = {
  title: 'Entrar | Kairós Auto',
  description: 'Faça login na sua conta para anunciar ou salvar seus carros favoritos.',
};

export default function Page() {
  return <LoginClient />;
}
