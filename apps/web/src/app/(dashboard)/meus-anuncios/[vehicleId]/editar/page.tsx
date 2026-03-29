import { Metadata } from 'next';
import { EditVehicleClient } from './EditVehicleClient';

type Props = {
  params: Promise<{ vehicleId: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Editar Anúncio | Seu Novo Carro',
    description: 'Edite o seu anúncio de veículo na Seu Novo Carro.',
  };
}

export default async function Page({ params }: Props) {
  const { vehicleId } = await params;
  return <EditVehicleClient vehicleId={vehicleId} />;
}
