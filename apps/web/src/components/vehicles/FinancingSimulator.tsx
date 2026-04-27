import { useState } from 'react';
import { Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';

interface FinancingSimulatorProps {
  vehiclePrice: number;
  vehicleName: string;
  monthlyInterestRatePercent?: number;
  acceptsTrade?: boolean;
  onSimulate?: (data: {
    downPayment: number;
    installments: number;
    monthlyPayment: number;
    financedAmount: number;
    totalToPay: number;
    interestRatePercent: number;
    tradeInEnabled: boolean;
    tradeInFipeValue: number;
  }) => void;
}

function WhatsAppIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.01 4.5c-6.34 0-11.5 5.12-11.5 11.42 0 2.02.53 4 1.53 5.75L4.5 27.5l6.02-1.5a11.54 11.54 0 0 0 5.49 1.39h.01c6.34 0 11.48-5.12 11.48-11.42S22.35 4.5 16.01 4.5Zm0 20.95h-.01a9.63 9.63 0 0 1-4.9-1.33l-.35-.21-3.57.89.95-3.47-.23-.36a9.43 9.43 0 0 1-1.47-5.05c0-5.23 4.28-9.48 9.56-9.48 5.27 0 9.56 4.25 9.56 9.48 0 5.22-4.29 9.48-9.54 9.48Zm5.25-7.14c-.29-.15-1.72-.84-1.99-.93-.27-.1-.47-.15-.67.14-.2.29-.77.93-.95 1.12-.17.2-.35.22-.64.07-.29-.14-1.24-.45-2.36-1.43-.88-.77-1.47-1.72-1.64-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.35.44-.52.15-.17.2-.29.3-.49.1-.2.05-.37-.03-.52-.08-.14-.67-1.62-.92-2.22-.24-.57-.49-.49-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.29-1.04 1.01-1.04 2.46 0 1.45 1.07 2.85 1.22 3.04.15.2 2.08 3.3 5.14 4.5.73.31 1.3.49 1.75.63.74.24 1.41.21 1.94.13.59-.09 1.72-.7 1.96-1.38.24-.68.24-1.26.17-1.38-.06-.12-.25-.19-.54-.34Z"
      />
    </svg>
  );
}

export function FinancingSimulator({
  vehiclePrice,
  vehicleName,
  monthlyInterestRatePercent = 1.5,
  acceptsTrade = false,
  onSimulate,
}: FinancingSimulatorProps) {
  const [downPayment, setDownPayment] = useState(Math.round(vehiclePrice * 0.2));
  const [installments, setInstallments] = useState(48);
  const [tradeInEnabled, setTradeInEnabled] = useState(false);
  const [tradeInFipeValue, setTradeInFipeValue] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  
  const interestRate = Math.max(0, monthlyInterestRatePercent) / 100;
  const tradeInValueApplied = tradeInEnabled ? Math.max(0, tradeInFipeValue) : 0;
  const financedAmount = Math.max(0, vehiclePrice - downPayment - tradeInValueApplied);
  const monthlyPayment =
    financedAmount <= 0
      ? 0
      : interestRate <= 0
        ? financedAmount / installments
        : financedAmount * (interestRate * Math.pow(1 + interestRate, installments)) /
          (Math.pow(1 + interestRate, installments) - 1);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleSimulate = () => {
    const totalToPay = downPayment + (monthlyPayment * installments);
    onSimulate?.({
      downPayment,
      installments,
      monthlyPayment,
      financedAmount,
      totalToPay,
      interestRatePercent: monthlyInterestRatePercent,
      tradeInEnabled,
      tradeInFipeValue: tradeInValueApplied,
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Calculator className="h-4 w-4 mr-2" />
          Simular Financiamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Simular Financiamento
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="p-4 bg-muted rounded-xl">
            <p className="text-sm text-muted-foreground">Veículo</p>
            <p className="font-semibold">{vehicleName}</p>
            <p className="text-2xl font-bold gradient-brand-text">{formatCurrency(vehiclePrice)}</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Entrada</Label>
                <span className="font-semibold text-primary">{formatCurrency(downPayment)}</span>
              </div>
              <Slider
                value={[downPayment]}
                onValueChange={([v]) => setDownPayment(v)}
                min={0}
                max={vehiclePrice * 0.5}
                step={1000}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                {Math.round((downPayment / vehiclePrice) * 100)}% do valor do veículo
              </p>
            </div>

            <div className="space-y-3 rounded-lg border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="trade-in-switch">Tenho veículo para troca</Label>
                <Switch
                  id="trade-in-switch"
                  checked={tradeInEnabled}
                  onCheckedChange={setTradeInEnabled}
                />
              </div>
              {tradeInEnabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="trade-in-fipe">Valor FIPE estimado do veículo</Label>
                    <Input
                      id="trade-in-fipe"
                      type="number"
                      min={0}
                      step={500}
                      value={tradeInFipeValue || ''}
                      onChange={(e) => setTradeInFipeValue(Number(e.target.value) || 0)}
                      placeholder="Ex.: 45000"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    O valor da troca é apenas estimativo pela FIPE e está sujeito a análise da
                    condição do veículo por um especialista.
                  </p>
                  {!acceptsTrade && (
                    <p className="text-xs text-amber-700">
                      Este anúncio não marcou troca como padrão, mas você pode informar interesse
                      para avaliação.
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Parcelas</Label>
                <span className="font-semibold text-primary">{installments}x</span>
              </div>
              <Slider
                value={[installments]}
                onValueChange={([v]) => setInstallments(v)}
                min={12}
                max={60}
                step={6}
                className="w-full"
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 text-center border border-primary/20">
            <p className="text-sm text-muted-foreground mb-1">Parcela estimada</p>
            <p className="text-4xl font-bold gradient-brand-text">
              {formatCurrency(monthlyPayment)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              *Simulação com taxa média de {monthlyInterestRatePercent}% a.m. Valores sujeitos a
              análise de crédito.
            </p>
          </div>

          <div className="space-y-2 text-sm bg-muted/50 rounded-lg p-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor financiado:</span>
              <span className="font-medium">{formatCurrency(financedAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total a pagar:</span>
              <span className="font-medium">{formatCurrency(downPayment + (monthlyPayment * installments))}</span>
            </div>
            {tradeInEnabled && tradeInValueApplied > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Troca (FIPE estimada):</span>
                <span className="font-medium">{formatCurrency(tradeInValueApplied)}</span>
              </div>
            )}
          </div>

          <Button 
            variant="kairos" 
            className="w-full"
            onClick={handleSimulate}
          >
            <WhatsAppIcon className="h-5 w-5 mr-2 shrink-0" />
            Tenho Interesse neste Financiamento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function getInstallmentPreview(
  price: number,
  months: number = 60,
  monthlyInterestRatePercent: number = 1.5,
): number {
  const interestRate = Math.max(0, monthlyInterestRatePercent) / 100;
  if (interestRate <= 0) return price / months;
  return (
    price *
    (interestRate * Math.pow(1 + interestRate, months)) /
    (Math.pow(1 + interestRate, months) - 1)
  );
}
