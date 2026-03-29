import { useState } from 'react';
import { MessageSquare, Phone, User, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getStoredUTM } from '@/hooks/useUTM';
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
  onSelectChat: () => void;
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
  onSelectChat,
}: ContactOptionsModalProps) {
  const { user, profile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isLoadingWhatsApp, setIsLoadingWhatsApp] = useState(false);

  const createLeadAndRedirect = async () => {
    if (!user) return;

    setIsLoadingWhatsApp(true);

    try {
      const utmParams = getStoredUTM();
      const userName = profile?.full_name || user.email?.split('@')[0] || 'Usuário';
      const userPhone = profile?.whatsapp || profile?.phone || '';
      const userEmail = user.email || '';

      // Check if lead already exists for this user + vehicle
      const { data: existingLead } = await supabase
        .from('leads')
        .select('id')
        .eq('vehicle_id', vehicleId)
        .eq('email', userEmail)
        .maybeSingle();

      if (!existingLead) {
        // Create new lead
        await supabase.from('leads').insert({
          vehicle_id: vehicleId,
          name: userName,
          phone: userPhone,
          email: userEmail,
          source: 'whatsapp',
          utm_source: utmParams.utm_source,
          utm_medium: utmParams.utm_medium,
          utm_campaign: utmParams.utm_campaign,
          utm_term: utmParams.utm_term,
          utm_content: utmParams.utm_content,
          referrer: utmParams.referrer,
        });
      }

      // Track lead event
      trackLead('whatsapp', {
        vehicleId,
        vehicleName,
        value: vehiclePrice,
      });

      // Redirect to WhatsApp
      const message = encodeURIComponent(
        `Olá! Sou ${userName} e vi o ${vehicleName} no Seu Novo Carro. Gostaria de mais informações!`
      );
      const cleanPhone = sellerWhatsapp.replace(/\D/g, '');
      window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');

      onClose();
    } catch (error: any) {
      console.error('Error creating lead:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingWhatsApp(false);
    }
  };

  const handleWhatsApp = () => {
    if (user) {
      // If logged in, create lead and redirect
      createLeadAndRedirect();
    } else {
      // If not logged in, redirect to register with return info
      const params = new URLSearchParams({
        returnTo: pathname,
        action: 'whatsapp',
        vehicleId,
        vehicleName,
        sellerWhatsapp,
      });
      router.push(`/cadastro?${params.toString()}`);
      onClose();
    }
  };

  const handleChatClick = () => {
    if (!user) {
      // Redirect to register
      const params = new URLSearchParams({
        returnTo: pathname,
        action: 'chat',
      });
      router.push(`/cadastro?${params.toString()}`);
      onClose();
      return;
    }
    onSelectChat();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-center font-heading text-xl">
            Entrar em Contato
          </DialogTitle>
        </DialogHeader>

        {/* Seller Info */}
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

        {/* Options */}
        <div className="px-6 pb-6 space-y-3">
          {/* Chat Option */}
          <motion.button
            onClick={handleChatClick}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-colors text-left group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="p-3 rounded-full bg-primary/10">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">Conversar pelo Chat</p>
              <p className="text-sm text-muted-foreground">Resposta rápida pelo chat</p>
            </div>
            <ArrowRight className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>

          {/* WhatsApp Option */}
          <motion.button
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
              <p className="text-sm text-muted-foreground">Falar diretamente com o vendedor</p>
            </div>
            <ArrowRight className="h-5 w-5 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        </div>

        {!user && (
          <div className="px-6 pb-6">
            <p className="text-xs text-center text-muted-foreground">
              Para entrar em contato, você precisa ter uma conta.{' '}
              <button 
                onClick={() => { 
                  router.push(`/cadastro?returnTo=${encodeURIComponent(pathname)}`); 
                  onClose(); 
                }}
                className="text-primary hover:underline font-medium"
              >
                Criar conta
              </button>
              {' '}ou{' '}
              <button 
                onClick={() => { 
                  router.push(`/login?returnTo=${encodeURIComponent(pathname)}`); 
                  onClose(); 
                }}
                className="text-primary hover:underline font-medium"
              >
                Entrar
              </button>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
