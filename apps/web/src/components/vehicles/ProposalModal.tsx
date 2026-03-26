import { useState } from 'react';
import { DollarSign, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useCreateProposal } from '@/hooks/useProposals';
import { useAuth } from '@/contexts/AuthContext';

interface ProposalModalProps {
  vehicleId: string;
  vehicleName: string;
  vehiclePrice: number;
}

export function ProposalModal({ vehicleId, vehicleName, vehiclePrice }: ProposalModalProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const createProposal = useCreateProposal();
  const [isOpen, setIsOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    buyer_name: profile?.full_name || '',
    buyer_phone: profile?.whatsapp || profile?.phone || '',
    buyer_email: user?.email || '',
    amount: vehiclePrice,
    message: '',
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.buyer_name || !formData.buyer_phone || !formData.amount) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha nome, telefone e valor da proposta.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createProposal.mutateAsync({
        vehicle_id: vehicleId,
        buyer_name: formData.buyer_name,
        buyer_phone: formData.buyer_phone,
        buyer_email: formData.buyer_email || undefined,
        amount: formData.amount,
        message: formData.message || undefined,
      });

      toast({
        title: 'Proposta enviada!',
        description: 'O vendedor receberá sua proposta e entrará em contato.',
      });

      setIsOpen(false);
    } catch (error: any) {
      toast({
        title: 'Erro ao enviar proposta',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const discount = ((vehiclePrice - formData.amount) / vehiclePrice) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <DollarSign className="h-4 w-4 mr-2" />
          Fazer Proposta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Fazer Proposta
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="p-4 bg-muted rounded-xl">
            <p className="text-sm text-muted-foreground">Veículo</p>
            <p className="font-semibold">{vehicleName}</p>
            <p className="text-xl font-bold text-muted-foreground">
              Preço anunciado: {formatCurrency(vehiclePrice)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Sua proposta *</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Ex: 85000"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              required
            />
            {formData.amount < vehiclePrice && discount > 0 && (
              <p className="text-xs text-orange-500">
                {discount.toFixed(1)}% abaixo do preço anunciado
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buyer_name">Seu nome *</Label>
              <Input
                id="buyer_name"
                placeholder="Seu nome"
                value={formData.buyer_name}
                onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buyer_phone">WhatsApp *</Label>
              <Input
                id="buyer_phone"
                placeholder="(11) 99999-9999"
                value={formData.buyer_phone}
                onChange={(e) => setFormData({ ...formData, buyer_phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="buyer_email">E-mail</Label>
            <Input
              id="buyer_email"
              type="email"
              placeholder="seu@email.com"
              value={formData.buyer_email}
              onChange={(e) => setFormData({ ...formData, buyer_email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem (opcional)</Label>
            <Textarea
              id="message"
              placeholder="Ex: Posso pagar à vista..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            variant="kairos" 
            className="w-full"
            disabled={createProposal.isPending}
          >
            {createProposal.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar Proposta'
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            O vendedor receberá sua proposta e tem 48h para responder.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
