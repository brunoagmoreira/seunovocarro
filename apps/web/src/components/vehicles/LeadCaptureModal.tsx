import { useState } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';
import { getStoredUTM } from '@/hooks/useUTM';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: string;
  vehicleName: string;
  sellerWhatsapp: string;
  sellerPhone?: string;
  source?: 'whatsapp' | 'phone';
}

export function LeadCaptureModal({
  isOpen,
  onClose,
  vehicleId,
  vehicleName,
  sellerWhatsapp,
}: LeadCaptureModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

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
      // Get UTM params
      const utmParams = getStoredUTM();

      // Save lead to database with UTM data
      const { error } = await supabase.from('leads').insert({
        vehicle_id: vehicleId,
        name: formData.name,
        phone: formData.phone,
        source: 'whatsapp',
        utm_source: utmParams.utm_source,
        utm_medium: utmParams.utm_medium,
        utm_campaign: utmParams.utm_campaign,
        utm_term: utmParams.utm_term,
        utm_content: utmParams.utm_content,
        referrer: utmParams.referrer,
      } as any);

      if (error) {
        console.error('Lead save error:', error);
        // Continue anyway - we want the user to be able to contact
      }

      // Redirect to WhatsApp
      const message = encodeURIComponent(
        `Olá! Sou ${formData.name} e vi o ${vehicleName} no Seu Novo Carro. Gostaria de mais informações!`
      );
      const cleanPhone = sellerWhatsapp.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${message}`;
      window.open(whatsappUrl, '_blank');

      onClose();
      
      // Reset form
      setFormData({ name: '', phone: '' });

      toast({
        title: "Sucesso!",
        description: "Você será redirecionado para o WhatsApp.",
      });

    } catch (error: any) {
      console.error('Error saving lead:', error);
      // Still redirect even if save fails
      const message = encodeURIComponent(
        `Olá! Vi o ${vehicleName} no Seu Novo Carro. Gostaria de mais informações!`
      );
      const cleanPhone = sellerWhatsapp.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${message}`;
      window.open(whatsappUrl, '_blank');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Falar com o vendedor</DialogTitle>
          <DialogDescription>
            Preencha seus dados para entrar em contato via WhatsApp
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lead-name">Seu nome *</Label>
            <Input
              id="lead-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Como você se chama?"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead-phone">Seu WhatsApp *</Label>
            <Input
              id="lead-phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(11) 99999-9999"
              required
            />
          </div>

          <Button
            type="submit"
            variant="whatsapp"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <MessageCircle className="h-4 w-4 mr-2" />
            )}
            Enviar pelo WhatsApp
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
