import { MessageSquare, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ConversasPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 animate-fade-in">
      <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-xl">
        <MessageSquare className="w-10 h-10 text-blue-500" />
      </div>
      <h1 className="text-3xl font-black text-gray-800 font-heading mb-4">Central de Mensagens</h1>
      <p className="text-gray-500 max-w-md mb-8">O WebSockets do chat em tempo real entre compradores e vendedores está em fase final de testes laboratoriais pela Kairos Auto. Em breve!</p>
      <Link href="/" className="inline-flex items-center text-blue-500 font-semibold hover:underline">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Home
      </Link>
    </div>
  );
}
