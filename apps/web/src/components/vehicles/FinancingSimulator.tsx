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
    interestRatePercent: number;
    tradeInEnabled: boolean;
    tradeInFipeValue: number;
  }) => void;
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
    onSimulate?.({
      downPayment,
      installments,
      monthlyPayment,
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

            {acceptsTrade && (
              <div className="space-y-3 rounded-lg border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="trade-in-switch">Usar veículo atual na troca</Label>
                  <Switch
                    id="trade-in-switch"
                    checked={tradeInEnabled}
                    onCheckedChange={setTradeInEnabled}
                  />
                </div>
                {tradeInEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="trade-in-fipe">Valor FIPE do seu veículo</Label>
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
                      O valor de troca pela FIPE é apenas estimativo e ainda precisa passar por
                      avaliação com um especialista.
                    </p>
                  </>
                )}
              </div>
            )}

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
