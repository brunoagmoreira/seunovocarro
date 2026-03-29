import { Metadata } from 'next';
import { HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Perguntas Frequentes | Seu Novo Carro',
  description: 'Tire suas dúvidas sobre como comprar ou anunciar no Seu Novo Carro.',
};

export default function FAQPage() {
  const faqs = [
    {
      question: "Os carros anunciados são realmente verificados?",
      answer: "Sim. Todos os lojistas cadastrados em nossa plataforma passam por uma checagem rigorosa de autenticidade (comprovante de endereço, CNPJ e reputação) antes de poderem publicar anúncios. Isso garante um ambiente 100% seguro contra golpes."
    },
    {
      question: "Por que vocês focam apenas em BH e região?",
      answer: "Ao focarmos exclusivamente em Belo Horizonte e RMBH, diminuímos drasticamente a chance de negociações falsas de outros estados, garantimos que você consiga visitar o carro no mesmo dia e impulsionamos a economia local!"
    },
    {
      question: "Sou comprador. Pago alguma taxa para usar o Seu Novo Carro?",
      answer: "De forma alguma! Para você que está procurando o seu próximo veículo, nossa plataforma é e sempre será 100% gratuita. Apenas encontre o carro que combina com você e inicie o chat direto com o vendedor."
    },
    {
      question: "Como o chat funciona? A loja me responde na hora?",
      answer: "A comunicação ocorre em tempo real, sem intermediários confusos. Nossos lojistas são instruídos a prestarem um atendimento premium e recebem notificações diretas para te responderem no mesmo instante."
    },
    {
      question: "Sou lojista. Como faço para anunciar e impulsionar meu estoque?",
      answer: "No 'Seu Novo Carro', tratamos cada veículo como um produto único. Conheça nossos planos de impulsionamento acessando a aba 'Impulsionar'. Nossa IA qualifica os interessados, economizando o seu tempo na hora de fechar a venda."
    }
  ];

  return (
    <div className="bg-background min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-kairos-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8 text-kairos-primary" />
          </div>
          <h1 className="text-4xl font-heading font-black tracking-tight text-foreground mb-4">
            Perguntas Frequentes
          </h1>
          <p className="text-lg text-muted-foreground">
            Tudo o que você precisa saber para comprar ou vender o seu carro com segurança.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-card border border-border rounded-xl p-6 hover:shadow-card transition-shadow">
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-start">
                <span className="text-kairos-primary mr-3 text-xl font-bold">Q.</span>
                {faq.question}
              </h3>
              <p className="text-muted-foreground ml-8">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
