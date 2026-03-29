import { useState } from 'react';
import { Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
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
  onSimulate?: (data: { downPayment: number; installments: number; monthlyPayment: number }) => void;
}

export function FinancingSimulator({ vehiclePrice, vehicleName, onSimulate }: FinancingSimulatorProps) {
  const [downPayment, setDownPayment] = useState(Math.round(vehiclePrice * 0.2)); // 20% entrada
  const [installments, setInstallments] = useState(48);
  const [isOpen, setIsOpen] = useState(false);
  
  const interestRate = 0.015; // 1.5% ao mês
  const financedAmount = vehiclePrice - downPayment;
  const monthlyPayment = financedAmount > 0 
    ? financedAmount * (interestRate * Math.pow(1 + interestRate, installments)) / (Math.pow(1 + interestRate, installments) - 1)
    : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleSimulate = () => {
    onSimulate?.({ downPayment, installments, monthlyPayment });
    setIsOpen(false);
  };

  // Calculate installment preview for card
  const previewInstallment = vehiclePrice * (interestRate * Math.pow(1 + interestRate, 60)) / (Math.pow(1 + interestRate, 60) - 1);

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
              *Simulação com taxa de 1.5% a.m. Valores sujeitos a análise de crédito.
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

export function getInstallmentPreview(price: number, months: number = 60): number {
  const interestRate = 0.015;
  return price * (interestRate * Math.pow(1 + interestRate, months)) / (Math.pow(1 + interestRate, months) - 1);
}
