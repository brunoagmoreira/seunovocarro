import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Send, Car, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { fetchApi } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { Socket } from 'socket.io-client';
import type { Conversation, Message } from '@/types/chat';

interface BuyerChatWindowProps {
  conversation: Conversation | null;
}

export function BuyerChatWindow({ conversation }: BuyerChatWindowProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const seller = (conversation as any)?.seller;

  // Fetch messages and setup socket
  useEffect(() => {
    if (!conversation?.id) return;

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const data = await fetchApi<Message[]>(`/chat/conversations/${conversation.id}/messages`, {
          requireAuth: true
        });
        setMessages(data);
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Socket.io integration
    const socket = getSocket(localStorage.getItem('snc_auth_token'));
    
    socket.emit('joinConversation', { conversationId: conversation.id });

    socket.on('newMessage', (newMsg: Message) => {
      // Avoid duplicates
      setMessages((prev) => (prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]));
    });

    return () => {
      socket.off('newMessage');
      socket.emit('leaveConversation', { conversationId: conversation.id });
      socket.disconnect();
    };
  }, [conversation?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark messages as read
  useEffect(() => {
    if (!conversation?.id) return;

    const markAsRead = async () => {
      try {
        await fetchApi(`/chat/conversations/${conversation.id}/read`, {
          method: 'POST',
          requireAuth: true
        });
      } catch (e) {
        // Silently fail
      }
    };

    markAsRead();
  }, [conversation?.id, messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !conversation) return;

    setIsSending(true);

    try {
      const socket = getSocket(localStorage.getItem('snc_auth_token'));
      socket.emit('sendMessage', {
        conversation_id: conversation.id,
        content: newMessage.trim(),
        sender_type: 'buyer', 
      });

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
            {conversation.vehicle?.media?.[0]?.url ? (
              <img 
                src={conversation.vehicle.media[0].url} 
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
              const isOwn = message.sender_type === 'buyer' || message.sender_type === 'lead';
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
                  
                  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`
                        max-w-[75%] px-4 py-2.5 rounded-2xl
                        ${isOwn 
                          ? 'bg-primary text-primary-foreground rounded-br-md' 
                          : 'bg-muted rounded-bl-md'
                        }
                      `}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      <p className={`text-[10px] mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
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
            placeholder="Digite sua mensagem..."
            className="flex-1"
            disabled={isSending}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            variant="kairos"
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
