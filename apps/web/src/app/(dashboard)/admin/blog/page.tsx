import { PenTool, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function BlogAdminPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 animate-fade-in">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-xl">
        <PenTool className="w-10 h-10 text-gray-400" />
      </div>
      <h1 className="text-3xl font-black text-gray-800 font-heading mb-4">Módulo de Blog</h1>
      <p className="text-gray-500 max-w-md mb-8">Esta área do painel administrativo está em desenvolvimento. Em breve você poderá criar, editar e gerenciar postagens e SEO do portal.</p>
      <Link href="/admin" className="inline-flex items-center text-[#268052] font-semibold hover:underline">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Painel Central
      </Link>
    </div>
  );
}
