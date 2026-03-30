"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { 
  ImageIcon, 
  Users, 
  CarFront, 
  Activity, 
  Store, 
  ShieldCheck 
} from 'lucide-react';

export default function AdminDashboard() {
  const { userRole, isLoading } = useAuth();
  const router = useRouter();

  // Verifica permissao de admin globalmente na montagem
  useEffect(() => {
    if (!isLoading && userRole !== 'admin') {
      router.push('/');
    }
  }, [userRole, isLoading, router]);

  if (isLoading || userRole !== 'admin') {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#268052]" />
      </div>
    );
  }

  const adminModules = [
    {
      title: 'Vitrine (Banners)',
      description: 'Gerencie o carrossel da página inicial',
      icon: ImageIcon,
      href: '/admin/banners',
      color: 'bg-emerald-50 text-emerald-600',
      active: true
    },
    {
      title: 'Usuários Autorizados',
      description: 'Controle de Lojistas e Equipe',
      icon: Users,
      href: '/admin/usuarios',
      color: 'bg-blue-50 text-blue-600',
      active: false
    },
    {
      title: 'Estoque Global',
      description: 'Supervisão de frota de todos os lojistas',
      icon: CarFront,
      href: '/admin/veiculos',
      color: 'bg-indigo-50 text-indigo-600',
      active: false
    },
    {
      title: 'Lojas Parceiras',
      description: 'Verificação e credenciamento',
      icon: Store,
      href: '/admin/lojas',
      color: 'bg-orange-50 text-orange-600',
      active: false
    },
    {
      title: 'Métricas KPI',
      description: 'Relatórios gerais e conversão',
      icon: Activity,
      href: '/admin/metricas',
      color: 'bg-purple-50 text-purple-600',
      active: false
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Cabeçalho */}
      <div className="mb-8 p-6 bg-gradient-to-r from-[#268052] to-[#346739] rounded-2xl shadow-xl flex items-center gap-6">
        <div className="w-16 h-16 bg-white/10 flex items-center justify-center rounded-xl backdrop-blur-md border border-white/20">
          <ShieldCheck className="w-8 h-8 text-[#FFD91A]" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white font-heading">Central de Comando</h1>
          <p className="text-white/80 mt-1">Bem-vindo, Administrador Supremo.</p>
        </div>
      </div>

      {/* Grid de Ferramentas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminModules.map((module, idx) => {
          const Icon = module.icon;
          
          if (!module.active) {
            return (
              <div key={idx} className="bg-white border rounded-2xl p-6 shadow-sm opacity-60 grayscale cursor-not-allowed">
                <div className="flex items-start gap-4">
                  <div className={`p-4 rounded-xl ${module.color} bg-gray-100 text-gray-400`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{module.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{module.description}</p>
                    <span className="inline-block mt-3 px-3 py-1 bg-gray-100 text-xs font-semibold rounded-full text-gray-500">
                      Em breve
                    </span>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <Link key={idx} href={module.href}>
              <div className="bg-white border-2 border-transparent hover:border-[#268052]/20 hover:shadow-lg rounded-2xl p-6 transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className={`p-4 rounded-xl ${module.color}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#268052] transition-colors">{module.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                    <span className="inline-block mt-3 text-sm font-semibold text-[#268052] group-hover:underline">
                      Acessar painel &rarr;
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
