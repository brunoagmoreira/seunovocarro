import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Send, Car, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Conversation, Message } from '@/types/chat';

// Helper for tables not in generated types
const db = {
  messages: () => supabase.from('messages' as any),
  conversations: () => supabase.from('conversations' as any),
};

interface BuyerChatWindowProps {
  conversation: Conversation | null;
}

export function BuyerChatWindow({ conversation }: BuyerChatWindowProps) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const seller = (conversation as any)?.seller;

  // Fetch messages
  useEffect(() => {
    if (!conversation?.id) return;

    const fetchMessages = async () => {
      setIsLoading(true);
      const { data, error } = await db.messages()
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data as unknown as Message[]);
      }
      setIsLoading(false);
    };

    fetchMessages();

    // Real-time subscription
    const channel = supabase
      .channel(`buyer-chat:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => (prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark seller messages as read
  useEffect(() => {
    if (!conversation?.id) return;

    const markAsRead = async () => {
      await db.messages()
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversation.id)
        .eq('sender_type', 'seller')
        .is('read_at', null);
    };

    markAsRead();
  }, [conversation?.id, messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !conversation) return;

    setIsSending(true);

    try {
      const { error } = await db.messages().insert({
        conversation_id: conversation.id,
        sender_id: conversation.lead_id,
        sender_type: 'lead',
        content: newMessage.trim(),
      });

      if (error) throw error;

      // Update conversation timestamp
      await db.conversations()
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversation.id);

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Car className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-heading font-semibold text-lg mb-2">
          Selecione uma conversa
        </h3>
        <p className="text-muted-foreground text-sm">
          Escolha uma conversa para continuar
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden">
            {conversation.vehicle?.images?.[0]?.url ? (
              <img 
                src={conversation.vehicle.images[0].url} 
                alt="" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Car className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-sm">
              {seller?.full_name || 'Vendedor'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {conversation.vehicle?.brand} {conversation.vehicle?.model} {conversation.vehicle?.year}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <Skeleton className="h-12 w-48 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : messages && messages.length > 0 ? (
          <div className="space-y-3">
            {messages.map((message, index) => {
              const isLead = message.sender_type === 'lead';
              const showDate = index === 0 || 
                new Date(messages[index - 1].created_at).toDateString() !== 
                new Date(message.created_at).toDateString();

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="text-center my-4">
                      <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        {format(new Date(message.created_at), "d 'de' MMMM", { locale: ptBR })}
                      </span>
                    </div>
                  )}
                  
                  <div className={`flex ${isLead ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`
                        max-w-[75%] px-4 py-2.5 rounded-2xl
                        ${isLead 
                          ? 'bg-primary text-primary-foreground rounded-br-md' 
                          : 'bg-muted rounded-bl-md'
                        }
                      `}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      <p className={`text-[10px] mt-1 ${isLead ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {format(new Date(message.created_at), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground text-sm">
              Nenhuma mensagem ainda
            </p>
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="shrink-0 p-4 border-t bg-card">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="flex-1"
            disabled={isSending}
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            className="shrink-0"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
