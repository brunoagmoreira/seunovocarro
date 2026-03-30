import Link from 'next/link';
import { Heart, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Meus Favoritos | Seu Novo Carro',
  description: 'Gerencie seus veículos favoritos.',
};

export default function FavoritosPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-20 bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
        {/* Ícone flutuante Premium */}
        <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#FFD91A]/20 rounded-full animate-ping opacity-75"></div>
          <div className="relative bg-[#FFD91A] w-24 h-24 rounded-full flex items-center justify-center shadow-2xl border-4 border-white transform hover:scale-105 transition-transform duration-300">
            <Heart className="w-10 h-10 text-[#268052] fill-current" />
          </div>
        </div>

        {/* Copywriting */}
        <div className="space-y-4">
          <h1 className="text-4xl font-heading font-black text-[#268052] tracking-tight">
            Em Breve
          </h1>
          <p className="text-gray-600 text-lg font-light leading-relaxed">
            Estamos polindo as engrenagens! Em breve você poderá salvar e comparar seus veículos favoritos aqui, com todas as métricas detalhadas.
          </p>
        </div>

        {/* Ações */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/veiculos" className="w-full sm:w-auto">
            <Button size="lg" className="w-full bg-[#268052] hover:bg-[#1e6642] text-white rounded-full font-semibold h-14 px-8 shadow-lg shadow-[#268052]/20">
              <Search className="w-5 h-5 mr-2" />
              Explorar Ofertas
            </Button>
          </Link>
          <Link href="/" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full rounded-full border-2 border-gray-200 hover:bg-gray-100 text-gray-700 h-14 px-8 font-semibold">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Página Inicial
            </Button>
          </Link>
        </div>
        
      </div>
    </div>
  );
}
