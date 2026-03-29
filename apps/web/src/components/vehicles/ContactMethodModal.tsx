import { useState } from 'react';
import { MessageCircle, MessageSquare, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { fetchApi } from '@/lib/api';
import { getStoredUTM } from '@/hooks/useUTM';

interface ContactMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: string;
  vehicleName: string;
  sellerId: string;
  sellerWhatsapp: string;
  sellerPhone?: string;
}

type Step = 'choose' | 'form';
type ContactMethod = 'whatsapp' | 'chat';

export function ContactMethodModal({
  isOpen,
  onClose,
  vehicleId,
  vehicleName,
  sellerId,
  sellerWhatsapp,
}: ContactMethodModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('choose');
  const [contactMethod, setContactMethod] = useState<ContactMethod>('whatsapp');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  const handleClose = () => {
    setStep('choose');
    setFormData({ name: '', phone: '' });
    onClose();
  };

  const handleChoose = (method: ContactMethod) => {
    setContactMethod(method);
    setStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha seu nome e WhatsApp.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const utmParams = getStoredUTM();

      // Registrar o lead na API NestJS
      const lead = await fetchApi<any>('/leads', {
        method: 'POST',
        body: JSON.stringify({
          vehicle_id: vehicleId,
          name: formData.name,
          phone: formData.phone,
          source: contactMethod === 'chat' ? 'form' : contactMethod,
          utm_source: utmParams.utm_source,
          utm_medium: utmParams.utm_medium,
          utm_campaign: utmParams.utm_campaign,
        }),
      });

      const leadId = lead.id;

      if (contactMethod === 'whatsapp') {
        // Redirect to WhatsApp
        const message = encodeURIComponent(
          `Olá! Sou ${formData.name} e vi o ${vehicleName} no Seu Novo Carro. Gostaria de mais informações!`
        );
        const cleanPhone = sellerWhatsapp.replace(/\D/g, '');
        const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${message}`;
        window.open(whatsappUrl, '_blank');
        
        toast({
          title: "Sucesso!",
          description: "Você será redirecionado para o WhatsApp.",
        });
      } else {
        // Iniciar conversa via API NestJS
        const conversation = await fetchApi<any>('/chat/conversations', {
          method: 'POST',
          body: JSON.stringify({
            vehicle_id: vehicleId,
            seller_id: sellerId,
            lead_id: leadId,
            initial_message: `Olá! Sou ${formData.name} e vi o ${vehicleName}. Gostaria de mais informações!`
          }),
        });

        toast({
          title: "Mensagem enviada!",
          description: "O vendedor receberá sua mensagem e responderá em breve.",
        });
      }

      handleClose();
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === 'choose' ? (
          <>
            <DialogHeader>
              <DialogTitle>Como deseja falar com o vendedor?</DialogTitle>
              <DialogDescription>
                Escolha a forma de contato preferida
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4">
              <Button
                variant="outline"
                className="flex flex-col items-center gap-3 h-auto py-6 border-2 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
                onClick={() => handleChoose('whatsapp')}
              >
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                  <MessageCircle className="h-8 w-8 text-green-600" />
                </div>
                <span className="font-semibold">WhatsApp</span>
                <span className="text-xs text-muted-foreground text-center">
                  Abre no seu WhatsApp
                </span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col items-center gap-3 h-auto py-6 border-2 hover:border-primary hover:bg-primary/5 transition-all"
                onClick={() => handleChoose('chat')}
              >
                <div className="p-3 rounded-full bg-primary/10">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <span className="font-semibold">Chat</span>
                <span className="text-xs text-muted-foreground text-center">
                  Converse pelo site
                </span>
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                {contactMethod === 'whatsapp' ? 'Falar via WhatsApp' : 'Iniciar conversa'}
              </DialogTitle>
              <DialogDescription>
                Preencha seus dados para continuar
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Seu nome *</Label>
                <Input
                  id="contact-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Como você se chama?"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-phone">Seu WhatsApp *</Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep('choose')}
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  variant={contactMethod === 'whatsapp' ? 'whatsapp' : 'default'}
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : contactMethod === 'whatsapp' ? (
                    <MessageCircle className="h-4 w-4 mr-2" />
                  ) : (
                    <MessageSquare className="h-4 w-4 mr-2" />
                  )}
                  {contactMethod === 'whatsapp' ? 'Abrir WhatsApp' : 'Enviar mensagem'}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
