import { Metadata } from 'next';
import { CreateVehicleClient } from './CreateVehicleClient';

export const metadata: Metadata = {
  title: 'Criar Anúncio | Kairós Auto',
  description: 'Anuncie seu veículo na Kairós Auto e alcance milhares de compradores.',
};

export default function Page() {
  return <CreateVehicleClient />;
}
