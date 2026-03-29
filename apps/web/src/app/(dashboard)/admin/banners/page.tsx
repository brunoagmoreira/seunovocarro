import { Metadata } from 'next';
import { AdminBannersClient } from './AdminBannersClient';

export const metadata: Metadata = {
  title: 'Gestão de Banners | Seu Novo Carro Admin',
  description: 'Gerencie o carrossel da home do portal.',
};

export default function Page() {
  return <AdminBannersClient />;
}
