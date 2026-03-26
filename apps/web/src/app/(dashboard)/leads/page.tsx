import { Metadata } from 'next';
import { LeadsClient } from './LeadsClient';

export const metadata: Metadata = {
  title: 'Meus Leads | Kairós Auto',
  description: 'Gerencie os leads gerados pelos seus anúncios de veículos.',
};

export default function Page() {
  return <LeadsClient />;
}
