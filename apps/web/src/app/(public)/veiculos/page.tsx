import { Metadata } from 'next';
import { VehiclesClient } from './VehiclesClient';

export const metadata: Metadata = {
  title: "Veículos Disponíveis",
  description: "Encontre os melhores carros seminovos e usados na Kairós Auto com garantias e histórico limpo.",
};

export default function Page() {
  return <VehiclesClient />;
}
