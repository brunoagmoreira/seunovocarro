import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { fetchApi } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { Socket } from 'socket.io-client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getStoredUTM } from '@/hooks/useUTM';
import { trackLead } from '@/lib/tracking';

interface InlineChatProps {
  vehicleId: string;
  vehicleName: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  sellerWhatsapp: string;
}

interface ChatMessage {
  id: string;
  sender_id: string;
  sender_type: 'lead' | 'seller' | 'buyer';
  content: string;
  created_at: string;
}

interface UserData {
  id?: string;
  name: string;
  phone: string;
  type: 'lead' | 'user';
}

// Helpers removed to use direct fetchApi calls

export function InlineChat({
  vehicleId,
  vehicleName,
  sellerId,
  sellerName,
  sellerAvatar,
  sellerWhatsapp,
}: InlineChatProps) {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userData, setUserData] = useState<UserData>({ name: '', phone: '', type: 'lead' });
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if user is logged in and set up accordingly
  useEffect(() => {
    let cancelled = false;

    const initLoggedUser = async () => {
      if (!user) return;

      const displayName = profile?.full_name || user.email?.split('@')[0] || 'Usuário';
      const phone = profile?.phone || profile?.whatsapp || '';

      if (cancelled) return;
      setUserData({
        id: user.id,
        name: displayName,
        phone,
        type: 'user',
      });

      // Try to restore conversation from localStorage first
      const storageKey = `chat_user_${vehicleId}_${user.id}`;
      const savedConvId = localStorage.getItem(storageKey);
      if (savedConvId) {
        setConversationId(savedConvId);
        setIsRegistered(true);
        return;
      }

      // If no local cache, try to find an existing lead+conversation on server
      try {
        if (!user.email) return;

        const lead = await fetchApi<any>(`/leads/check?vehicleId=${vehicleId}&email=${user.email}`);
        const leadId = lead?.id;
        if (!leadId) return;

        const conv = await fetchApi<any>(`/chat/conversations/check?vehicleId=${vehicleId}&sellerId=${sellerId}&leadId=${leadId}`);
        const convId = conv?.id;
        
        if (convId) {
          setConversationId(convId);
          setIsRegistered(true);
          localStorage.setItem(storageKey, convId);
        }
      } catch (e) {
        console.error('Best-effort initialization failed:', e);
      }
    };

    if (user) {
      initLoggedUser();
    } else {
      // Load from localStorage for anonymous users
      const storageKey = `chat_${vehicleId}`;
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setUserData(parsed.userData || { name: '', phone: '', type: 'lead' });
        setConversationId(parsed.conversationId || null);
        setIsRegistered(!!parsed.userData?.id);
      }
    }

    return () => {
      cancelled = true;
    };
  }, [user, profile, vehicleId, sellerId]);

  // Fetch messages when conversationId is available
  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      try {
        const data = await fetchApi<ChatMessage[]>(`/chat/${conversationId}/messages`);
        setMessages(data);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();

    // Set up Socket.io client
    const socket = getSocket(localStorage.getItem('snc_auth_token'));
    
    socket.emit('joinConversation', { conversationId });

    socket.on('newMessage', (newMsg: ChatMessage) => {
      setMessages((prev) => (prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]));
    });

    return () => {
      socket.off('newMessage');
      socket.emit('leaveConversation', { conversationId });
      socket.disconnect();
    };
  }, [conversationId]);

  const saveToLocalStorage = (data: UserData, convId: string | null) => {
    if (user) {
      // For logged-in users, just save conversation ID
      const storageKey = `chat_user_${vehicleId}_${user.id}`;
      if (convId) localStorage.setItem(storageKey, convId);
    } else {
      // For anonymous users, save all data
      const storageKey = `chat_${vehicleId}`;
      localStorage.setItem(storageKey, JSON.stringify({
        userData: data,
        conversationId: convId,
      }));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Anonymous: needs name+phone
    if (!user && (!userData.name || !userData.phone)) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha seu nome e WhatsApp.',
        variant: 'destructive',
      });
      return;
    }

    // Logged-in: name is required; phone is required only if we don't have it on the profile
    if (user && !userData.name) {
      toast({
        title: 'Campo obrigatório',
        description: 'Preencha seu nome.',
        variant: 'destructive',
      });
      return;
    }

    if (user && !userData.phone) {
      toast({
        title: 'WhatsApp necessário',
        description: 'Informe seu WhatsApp para iniciar o chat.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      let leadId: string | undefined;
      let convId: string | null = null;

      if (user) {
        // Logged-in users: create/find a lead via API
        const email = user.email || null;
        const lead = await fetchApi<any>('/leads/register', {
          method: 'POST',
          body: JSON.stringify({
            vehicle_id: vehicleId,
            name: userData.name,
            phone: userData.phone,
            email: email,
            source: 'form',
            user_id: user.id
          }),
        });
        leadId = lead.id;
      } else {
        // Anonymous user via API
        const lead = await fetchApi<any>('/leads/register', {
          method: 'POST',
          body: JSON.stringify({
            vehicle_id: vehicleId,
            name: userData.name,
            phone: userData.phone,
            source: 'form'
          }),
        });
        leadId = lead.id;
      }

      if (!leadId) throw new Error('Não foi possível identificar o lead.');

      // Find/create conversation via API
      const conversation = await fetchApi<any>('/chat/conversations', {
        method: 'POST',
        body: JSON.stringify({
          vehicle_id: vehicleId,
          seller_id: sellerId,
          lead_id: leadId,
        }),
      });
      convId = conversation.id;

      // Track lead event for chat
      trackLead('chat', {
        vehicleId,
        vehicleName,
      });

      const updatedUserData = { ...userData, id: leadId };
      setUserData(updatedUserData);
      setConversationId(convId);
      setIsRegistered(true);
      saveToLocalStorage(updatedUserData, convId);

    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: 'Erro',
        description: error?.message || 'Não foi possível iniciar a conversa.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (
    content: string,
    convId?: string,
    senderId?: string,
    senderType?: 'lead' | 'seller' | 'buyer'
  ) => {
    const targetConvId = convId || conversationId;
    const targetSenderType = senderType || (user ? 'buyer' : 'lead');

    if (!targetConvId || !content.trim()) return;

    setIsSending(true);

    try {
      const socket = getSocket(localStorage.getItem('snc_auth_token'));
      socket.emit('sendMessage', {
        conversation_id: targetConvId,
        content: content.trim(),
        sender_type: user ? 'buyer' : 'lead',
      });

      setNewMessage('');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage);
    }
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Sou ${userData.name} e vi o ${vehicleName} no Seu Novo Carro. Gostaria de mais informações!`
    );
    const cleanPhone = sellerWhatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Check if user is the seller
  const isUserSeller = user?.id === sellerId;
  
  if (isUserSeller) {
    return null; // Don't show chat to the seller on their own vehicle
  }

  return (
    <div className="bg-card rounded-2xl shadow-card overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Conversar com o vendedor</h3>
            <p className="text-xs text-muted-foreground">
              {user ? 'Chat direto' : 'Resposta rápida pelo chat'}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isExpanded ? (
            <X className="h-5 w-5 text-muted-foreground" />
          ) : (
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
          )}
        </motion.div>
      </div>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border">
              {!isRegistered ? (
                // Registration Form
                <form onSubmit={handleRegister} className="p-4 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {user
                      ? 'Confirme seus dados para iniciar a conversa'
                      : 'Preencha seus dados para iniciar a conversa'}
                  </p>
                  <Input
                    placeholder="Seu nome"
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    required
                  />
                  {(!user || (user && !userData.phone)) && (
                    <Input
                      type="tel"
                      placeholder="Seu WhatsApp (11) 99999-9999"
                      value={userData.phone}
                      onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                      required
                    />
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Iniciando...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Iniciar conversa
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                // Chat Interface
                <div className="flex flex-col h-80">
                  {/* Seller Info */}
                  <div className="flex items-center gap-3 p-3 border-b border-border bg-muted/30">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={sellerAvatar} />
                      <AvatarFallback>{sellerName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{sellerName}</p>
                      <p className="text-xs text-muted-foreground">Vendedor</p>
                    </div>
                    {sellerWhatsapp && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0 text-xs"
                        onClick={handleWhatsApp}
                      >
                        WhatsApp
                      </Button>
                    )}
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-3">
                    <div className="space-y-3">
                      {messages.length === 0 && (
                        <p className="text-center text-sm text-muted-foreground py-8">
                          Aguardando mensagens...
                        </p>
                      )}
                      {messages.map((msg) => {
                        const isOwnMessage = msg.sender_type === 'lead' || msg.sender_type === 'buyer';
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                                isOwnMessage
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  isOwnMessage
                                    ? 'text-primary-foreground/70'
                                    : 'text-muted-foreground'
                                }`}
                              >
                                {formatTime(msg.created_at)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
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
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
