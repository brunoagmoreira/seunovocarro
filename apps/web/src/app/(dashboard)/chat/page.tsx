import { Metadata } from 'next';
import { ChatsClient } from './ChatsClient';

export const metadata: Metadata = {
  title: 'Chats e Mensagens | Seu Novo Carro',
  description: 'Comunique-se diretamente com potenciais compradores de veículos.',
};

export default function Page() {
  return <ChatsClient />;
}
