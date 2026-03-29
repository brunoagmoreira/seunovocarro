import { Metadata } from 'next';
import { MyVehiclesClient } from './MyVehiclesClient';

export const metadata: Metadata = {
  title: 'Meus Anúncios | Seu Novo Carro',
  description: 'Gerencie seus anúncios de veículos na Seu Novo Carro.',
};

export default function Page() {
  return <MyVehiclesClient />;
}
