import { Metadata } from 'next';
import { Rocket, Target, Zap, Bot } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Impulsionar | Seu Novo Carro',
  description: 'Venda seus veículos mais rápido com nossos planos de impulsionamento impulsionados por IA e Mídia Direcionada.',
};

export default function ImpulsionarPage() {
  return (
    <div className="bg-background min-h-screen py-16">
      <div className="container mx-auto px-4">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="w-16 h-16 bg-kairos-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Rocket className="w-8 h-8 text-kairos-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight text-foreground mb-4">
            Acelere Suas Vendas com <span className="text-kairos-primary">Mídia Direcionada</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Aqui no Seu Novo Carro, seu tempo é tratado como ouro. Nossa Inteligência Artificial gerencia campanhas exclusivas para o seu estoque e qualifica todos os leads antes que eles cheguem até você.
          </p>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 max-w-5xl mx-auto">
          
          <div className="bg-card border border-border flex items-start p-6 rounded-xl hover:shadow-card transition-shadow">
            <div className="w-12 h-12 bg-kairos-primary/10 rounded-full flex items-center justify-center mr-6 shrink-0 text-kairos-primary">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Compradores da sua Região</h3>
              <p className="text-muted-foreground text-sm">
                Desenhamos anúncios no Meta (Face/Insta) que impactam exclusivamente quem já está em Belo Horizonte procurando veículos. Acertamos direto no alvo.
              </p>
            </div>
          </div>

          <div className="bg-card border border-border flex items-start p-6 rounded-xl hover:shadow-card transition-shadow">
            <div className="w-12 h-12 bg-kairos-primary/10 rounded-full flex items-center justify-center mr-6 shrink-0 text-kairos-primary">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Filtro de IA Exclusivo</h3>
              <p className="text-muted-foreground text-sm">
                Farto de curiosos no WhatsApp mandando "tá disponível?" Nossa IA responde no portal e faz uma varredura para identificar se a pessoa tem crédito aprovado.
              </p>
            </div>
          </div>

        </div>

        {/* CTA Section */}
        <div className="text-center bg-muted/50 rounded-2xl p-10 max-w-4xl mx-auto border border-border">
           <Zap className="w-10 h-10 text-kairos-CTA mx-auto mb-4" />
           <h2 className="text-3xl font-heading font-bold mb-4">
             Pronto para acelerar?
           </h2>
           <p className="text-muted-foreground mb-8 text-lg">
             Para anunciar no portal, entre em contato direto com os nossos consultores e faremos a ativação do seu estoque via sistema.
           </p>
           <button className="bg-kairos-CTA hover:bg-kairos-CTA/90 text-black font-bold py-4 px-8 rounded-full shadow-lg shadow-kairos-CTA/20 transition-all text-lg">
             Falar no WhatsApp e Virar Parceiro
           </button>
        </div>

      </div>
    </div>
  );
}
