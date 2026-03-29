import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { Send, Loader2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { fetchApi } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import type { Message } from '@/types/chat';

interface ChatWindowProps {
  vehicleId: string;
  vehicleName: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  onClose?: () => void;
}

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Initialize or fetch conversation
  useEffect(() => {
    if (!user) return;

    const initConversation = async () => {
      setIsLoading(true);

      try {
        const buyerName = profile?.full_name || user.email?.split('@')[0] || 'Comprador';
        const buyerPhone = profile?.whatsapp || profile?.phone || '';

        // 1) Upsert Lead via API
        const lead = await fetchApi<any>(`/leads`, {
          method: 'POST',
          body: JSON.stringify({
            vehicle_id: vehicleId,
            name: buyerName,
            phone: buyerPhone,
            email: user.email,
            source: 'chat',
            user_id: user.id
          })
        });
        
        // 2) Find/Create Conversation
        const conversations = await fetchApi<any[]>(`/chat/conversations`, { requireAuth: true });
        let conv = conversations.find(c => c.vehicle_id === vehicleId && c.lead_id === lead.id);

        if (!conv) {
          // If not found, one might need a POST /chat/conversations in the future, 
          // but for now let's hope it exists or the logic is auto-handled.
          // Since the API doesn't have POST /chat/conversations yet (only schema side), 
          // let's stick to what we have in current code or fetch list.
          toast({
            title: 'Chat indisponível',
            description: 'Por favor, use o botão de Proposta para iniciar o contato.',
            variant: 'destructive',
          });
          onClose?.();
          return;
        }
        
        setConversationId(conv.id);
      } catch (error: any) {
        console.error('Init conversation error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initConversation();
  }, [user, profile, vehicleId, sellerId]);

  // Messages & Socket
  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      try {
        const data = await fetchApi<Message[]>(`/chat/conversations/${conversationId}/messages`, {
          requireAuth: true
        });
        setMessages(data);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();

    const socket = getSocket(localStorage.getItem('snc_auth_token'));
    socket.emit('joinConversation', { conversationId });

    socket.on('newMessage', (newMsg: Message) => {
      setMessages((prev) => (prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]));
    });

    return () => {
      socket.off('newMessage');
      socket.emit('leaveConversation', { conversationId });
      socket.disconnect();
    };
  }, [conversationId]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversationId || !newMessage.trim()) return;

    setIsSending(true);

    try {
      const socket = getSocket(localStorage.getItem('snc_auth_token'));
      socket.emit('sendMessage', {
        conversation_id: conversationId,
        content: newMessage.trim(),
        sender_type: 'buyer',
      });

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
      className="bg-card rounded-xl border border-border overflow-hidden shadow-card"
    >
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

      <ScrollArea className="h-64 p-3" ref={scrollRef}>
        <div className="space-y-3">
          {messages.map((msg) => {
            const isOwn = msg.sender_type === 'buyer' || msg.sender_type === 'lead';
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    isOwn
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p
                    className={`text-[10px] mt-1 ${
                      isOwn
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {format(new Date(msg.created_at), 'HH:mm')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

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
            variant="kairos"
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
