import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Send, Mail, Car, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  useConversationMessages, 
  useSendMessage, 
  useMarkAsRead,
  useChatSubscription 
} from '@/hooks/useChat';
import type { Conversation, Message } from '@/types/chat';
import { useAuth } from '@/contexts/AuthContext';

interface ChatWindowProps {
  conversation: Conversation | null;
}

export function ChatWindow({ conversation }: ChatWindowProps) {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { data: messages, isLoading } = useConversationMessages(conversation?.id);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();

  // Real-time subscription
  useChatSubscription(conversation?.id);

  // Mark messages as read when viewing
  useEffect(() => {
    if (conversation?.id && conversation.unread_count && conversation.unread_count > 0) {
      markAsRead.mutate(conversation.id);
    }
  }, [conversation?.id, conversation?.unread_count]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !conversation) return;

    await sendMessage.mutateAsync({
      conversationId: conversation.id,
      content: newMessage.trim(),
      senderType: 'seller'
    });

    setNewMessage('');
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
          Escolha uma conversa ao lado para começar a responder
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 p-4 border-b bg-card">
        <div className="flex items-center justify-between">
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
              <h3 className="font-semibold">
                {conversation.lead?.name || 'Lead'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {conversation.vehicle?.brand} {conversation.vehicle?.model} {conversation.vehicle?.year}
              </p>
            </div>
          </div>

          {/* Lead contact info */}
          <div className="flex gap-2">
            {conversation.lead?.email && (
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a href={`mailto:${conversation.lead.email}`}>
                  <Mail className="h-4 w-4 mr-1" />
                  Email
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <Skeleton className="h-12 w-48 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : messages && messages.length > 0 ? (
          <div className="space-y-3">
            {messages.map((message, index) => {
              const isSeller = message.sender_type === 'seller';
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
                  
                  <div className={`flex ${isSeller ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`
                        max-w-[75%] px-4 py-2.5 rounded-2xl
                        ${isSeller 
                          ? 'bg-primary text-primary-foreground rounded-br-md' 
                          : 'bg-muted rounded-bl-md'
                        }
                      `}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      <p className={`text-[10px] mt-1 ${isSeller ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
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
              Nenhuma mensagem ainda. Comece a conversa!
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
            disabled={sendMessage.isPending}
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || sendMessage.isPending}
            className="shrink-0"
          >
            {sendMessage.isPending ? (
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
