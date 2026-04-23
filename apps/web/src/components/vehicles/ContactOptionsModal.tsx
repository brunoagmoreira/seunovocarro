import { useState } from 'react';
import { Phone, User, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { trackLead } from '@/lib/tracking';

interface ContactOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: string;
  vehicleName: string;
  vehiclePrice?: number;
  sellerName: string;
  sellerAvatar?: string;
  sellerWhatsapp: string;
}

export function ContactOptionsModal({
  isOpen,
  onClose,
  vehicleId,
  vehicleName,
  vehiclePrice,
  sellerName,
  sellerAvatar,
  sellerWhatsapp,
}: ContactOptionsModalProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isLoadingWhatsApp, setIsLoadingWhatsApp] = useState(false);

  const openWhatsApp = () => {
    const userName =
      (user && (profile?.full_name || user.email?.split('@')[0])) || '';
    const message = encodeURIComponent(
      userName
        ? `Olá! Sou ${userName} e vi o ${vehicleName} no Seu Novo Carro. Gostaria de mais informações!`
        : `Olá! Vi o ${vehicleName} no Seu Novo Carro. Gostaria de mais informações!`
    );
    const digits = sellerWhatsapp.replace(/\D/g, '');
    if (!digits) {
      toast({
        title: 'WhatsApp indisponível',
        description: 'Este anúncio ainda não tem WhatsApp configurado.',
        variant: 'destructive',
      });
      return;
    }
    const phone = digits.startsWith('55') ? digits : `55${digits}`;
    trackLead('whatsapp', {
      vehicleId,
      vehicleName,
      value: vehiclePrice,
    });
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleWhatsApp = async () => {
    setIsLoadingWhatsApp(true);
    try {
      openWhatsApp();
      onClose();
    } finally {
      setIsLoadingWhatsApp(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-center font-heading text-xl">
            Falar com o vendedor
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-4">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {sellerAvatar ? (
                <img src={sellerAvatar} alt={sellerName} className="w-full h-full object-cover" />
              ) : (
                <User className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-semibold">{sellerName}</p>
              <p className="text-sm text-muted-foreground">Vendedor</p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <motion.button
            type="button"
            onClick={handleWhatsApp}
            disabled={isLoadingWhatsApp}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-green-500 bg-green-500/5 hover:bg-green-500/10 transition-colors text-left group disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="p-3 rounded-full bg-green-500/10">
              {isLoadingWhatsApp ? (
                <Loader2 className="h-6 w-6 text-green-600 animate-spin" />
              ) : (
                <Phone className="h-6 w-6 text-green-600" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">Chamar no WhatsApp</p>
              <p className="text-sm text-muted-foreground">Abre o WhatsApp com uma mensagem pronta</p>
            </div>
            <ArrowRight className="h-5 w-5 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
