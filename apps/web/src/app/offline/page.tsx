import Link from 'next/link';
import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Sem conexão | Seu Novo Carro',
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 pb-24 pt-20 text-center safe-bottom">
      <div className="rounded-2xl bg-muted/80 p-6 mb-6">
        <WifiOff className="h-14 w-14 text-muted-foreground mx-auto" aria-hidden />
      </div>
      <h1 className="font-heading text-2xl font-bold mb-2">Você está offline</h1>
      <p className="text-muted-foreground text-sm max-w-sm mb-8">
        Conecte-se à internet para buscar veículos e usar todas as funções do app.
      </p>
      <Button asChild size="lg" className="touch-target min-w-[200px]">
        <Link href="/">Tentar de novo</Link>
      </Button>
    </div>
  );
}
