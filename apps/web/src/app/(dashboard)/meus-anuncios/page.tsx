import { Metadata } from 'next';
import { MyVehiclesClient } from './MyVehiclesClient';

export const metadata: Metadata = {
  title: 'Meus Anúncios | Kairós Auto',
  description: 'Gerencie seus anúncios de veículos na Kairós Auto.',
};

export default function Page() {
  return <MyVehiclesClient />;
}
