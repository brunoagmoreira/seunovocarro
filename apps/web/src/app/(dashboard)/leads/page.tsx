import { Metadata } from 'next';
import { LeadsClient } from './LeadsClient';

export const metadata: Metadata = {
  title: 'Meus Leads | Seu Novo Carro',
  description: 'Gerencie os leads gerados pelos seus anúncios de veículos.',
};

export default function Page() {
  return <LeadsClient />;
}
