import { Metadata } from 'next';
import { Shield, Target, TrendingUp, Cpu } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sobre | Seu Novo Carro',
  description: 'Conheça o Seu Novo Carro: muito mais que um classificado, uma plataforma inteligente de impulsionamento e segurança.',
};

export default function AboutPage() {
  return (
    <div className="bg-background min-h-screen py-16">
      <div className="container mx-auto px-4">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight text-foreground mb-4">
            A forma mais <span className="text-kairos-primary">inteligente</span> de comprar e vender veículos.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Nascemos em Belo Horizonte com um único propósito: conectar compradores reais a vendedores de confiança. Esqueça classificados desatualizados e propostas falsas. Nós usamos inteligência e mídia direcionada para garantir segurança do início ao fim.
          </p>
        </div>

        {/* Pillars Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          
          <div className="bg-card border border-border rounded-xl p-8 hover:shadow-card transition-shadow text-center">
            <div className="w-14 h-14 bg-kairos-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-7 h-7 text-kairos-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Ambiente Verificado</h3>
            <p className="text-muted-foreground text-sm">
              Trabalhamos apenas com lojistas e veículos inspecionados. Mais transparência, sem surpresas na hora de avaliar.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-8 hover:shadow-card transition-shadow text-center">
            <div className="w-14 h-14 bg-kairos-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-7 h-7 text-kairos-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Mídia Direcionada</h3>
            <p className="text-muted-foreground text-sm">
              Seu carro não fica apenas em uma vitrine. Nós criamos campanhas de mídia paga agressivas para encontrar o comprador certo na sua região.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-8 hover:shadow-card transition-shadow text-center">
            <div className="w-14 h-14 bg-kairos-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Cpu className="w-7 h-7 text-kairos-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Inteligência Artificial</h3>
            <p className="text-muted-foreground text-sm">
              Os leads que chegam não são curiosos. Nossa IA qualifica as propostas, otimizando o tempo do vendedor.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-8 hover:shadow-card transition-shadow text-center">
            <div className="w-14 h-14 bg-kairos-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-7 h-7 text-kairos-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Sustentabilidade Local</h3>
            <p className="text-muted-foreground text-sm">
              Foco no mercado de BH e RMBH, aquecendo os negócios locais e diminuindo o risco de golpes intermunicipais.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
