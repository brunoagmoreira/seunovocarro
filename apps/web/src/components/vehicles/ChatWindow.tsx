import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ChatWindowProps {
  vehicleId: string;
  vehicleName: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  onClose?: () => void;
}

interface ChatMessage {
  id: string;
  sender_id: string;
  sender_type: 'lead' | 'seller';
  content: string;
  created_at: string;
}

// Helper for tables not in generated types
const db = {
  conversations: () => supabase.from('conversations' as any),
  messages: () => supabase.from('messages' as any),
};

export function ChatWindow({
  vehicleId,
  vehicleName,
  sellerId,
  sellerName,
  sellerAvatar,
  onClose,
}: ChatWindowProps) {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize or fetch conversation
  useEffect(() => {
    if (!user) return;

    const initConversation = async () => {
      setIsLoading(true);

      try {
        const buyerName = profile?.full_name || user.email?.split('@')[0] || 'Comprador';
        const buyerPhone = profile?.whatsapp || profile?.phone || '';

        if (!buyerPhone) {
          toast({
            title: 'WhatsApp necessário',
            description: 'Complete seu WhatsApp no perfil para iniciar o chat.',
            variant: 'destructive',
          });
          return;
        }

        // 1) Find/Create a lead silently (schema uses lead_id)
        const email = user.email || null;
        let foundLeadId: string | null = null;

        if (email) {
          const { data } = await supabase
            .from('leads')
            .select('id')
            .eq('vehicle_id', vehicleId)
            .eq('email', email)
            .maybeSingle();

          foundLeadId = (data as any)?.id ?? null;
        }

        if (!foundLeadId) {
          const { data } = await supabase
            .from('leads')
            .select('id')
            .eq('vehicle_id', vehicleId)
            .eq('phone', buyerPhone)
            .maybeSingle();

          foundLeadId = (data as any)?.id ?? null;
        }

        if (!foundLeadId) {
          const { data: newLead, error: leadError } = await supabase
            .from('leads')
            .insert({
              vehicle_id: vehicleId,
              name: buyerName,
              phone: buyerPhone,
              email,
              source: 'form',
            } as any)
            .select('id')
            .single();

          if (leadError) throw leadError;
          foundLeadId = (newLead as any)?.id ?? null;
        }

        if (!foundLeadId) {
          throw new Error('Não foi possível identificar o lead.');
        }

        setLeadId(foundLeadId);

        // 2) Find/Create conversation for this lead
        const { data: existingConv, error: findError } = await db.conversations()
          .select('id')
          .eq('vehicle_id', vehicleId)
          .eq('seller_id', sellerId)
          .eq('lead_id', foundLeadId)
          .maybeSingle();

        if (findError && (findError as any).code !== 'PGRST116') {
          console.error('Error finding conversation:', findError);
        }

        const convId = (existingConv as any)?.id as string | undefined;

        if (convId) {
          setConversationId(convId);
        } else {
          const { data: newConv, error: createError } = await db.conversations()
            .insert({
              vehicle_id: vehicleId,
              seller_id: sellerId,
              lead_id: foundLeadId,
            } as any)
            .select('id')
            .single();

          if (createError) throw createError;

          const createdId = (newConv as any)?.id as string | undefined;
          if (!createdId) throw new Error('Falha ao criar conversa.');

          setConversationId(createdId);
        }
      } catch (error: any) {
        console.error('Init conversation error:', error);
        toast({
          title: 'Erro',
          description: error?.message || 'Não foi possível iniciar a conversa.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    initConversation();
  }, [user, profile, vehicleId, sellerId, toast]);

  // Fetch messages when conversationId is available
  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      const { data, error } = await db.messages()
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data as unknown as ChatMessage[]);
      }
    };

    fetchMessages();

    // Set up real-time subscription
    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => (prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversationId || !newMessage.trim() || !leadId) return;

    setIsSending(true);

    try {
      const { error } = await db.messages().insert({
        conversation_id: conversationId,
        sender_id: leadId,
        sender_type: 'lead',
        content: newMessage.trim(),
      });

      if (error) throw error;

      // Update conversation timestamp
      await db.conversations()
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      setNewMessage('');
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a mensagem.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-6 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b border-border bg-muted/30">
        <Avatar className="h-10 w-10">
          <AvatarImage src={sellerAvatar} />
          <AvatarFallback>{sellerName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{sellerName}</p>
          <p className="text-xs text-muted-foreground">Vendedor</p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="h-64 p-3">
        <div className="space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              Iniciando conversa...
            </p>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_type === 'lead' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  msg.sender_type === 'lead'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.sender_type === 'lead'
                      ? 'text-primary-foreground/70'
                      : 'text-muted-foreground'
                  }`}
                >
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-border">
        <div className="flex gap-2">
          <Input
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSending}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isSending || !newMessage.trim()}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
