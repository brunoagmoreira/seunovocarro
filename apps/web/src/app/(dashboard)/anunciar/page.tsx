import { Metadata } from 'next';
import { CreateVehicleClient } from './CreateVehicleClient';

export const metadata: Metadata = {
  title: 'Criar Anúncio | Seu Novo Carro',
  description: 'Anuncie seu veículo na Seu Novo Carro e alcance milhares de compradores.',
};

export default function Page() {
  return <CreateVehicleClient />;
}
