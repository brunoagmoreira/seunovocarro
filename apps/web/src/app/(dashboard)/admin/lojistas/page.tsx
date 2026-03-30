import { Store, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LojistasAdminPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 animate-fade-in">
      <div className="w-24 h-24 bg-[#FFD91A]/20 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-xl">
        <Store className="w-10 h-10 text-[#FFD91A]" />
      </div>
      <h1 className="text-3xl font-black text-gray-800 font-heading mb-4">Gestão de Lojistas</h1>
      <p className="text-gray-500 max-w-md mb-8">O controle total sobre Lojistas, comissões, faturas e auditoria está no nosso próximo pacote de atualizações.</p>
      <Link href="/admin" className="inline-flex items-center text-[#268052] font-semibold hover:underline">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Painel Central
      </Link>
    </div>
  );
}
