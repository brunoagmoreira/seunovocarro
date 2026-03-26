import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageCircle, Car } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Conversation } from '@/types/chat';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (conversation: Conversation) => void;
  isLoading?: boolean;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  isLoading
}: ConversationListProps) {
  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-muted rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <MessageCircle className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm">
          Nenhuma conversa ainda
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-2 space-y-1">
        {conversations.map((conv) => {
          const isSelected = conv.id === selectedId;
          const hasUnread = (conv.unread_count || 0) > 0;
          const vehicleImage = conv.vehicle?.images?.[0]?.url;

          return (
            <button
              key={conv.id}
              onClick={() => onSelect(conv)}
              className={`
                w-full p-3 rounded-lg text-left transition-colors
                ${isSelected 
                  ? 'bg-primary/10 border border-primary/20' 
                  : 'hover:bg-muted/50'
                }
              `}
            >
              <div className="flex gap-3">
                {/* Vehicle thumbnail */}
                <div className="shrink-0 w-12 h-12 rounded-lg bg-muted overflow-hidden">
                  {vehicleImage ? (
                    <img 
                      src={vehicleImage} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium truncate ${hasUnread ? 'text-foreground' : ''}`}>
                      {conv.lead?.name || 'Lead'}
                    </p>
                    {hasUnread && (
                      <Badge variant="default" className="text-xs px-1.5 py-0">
                        {conv.unread_count}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground truncate">
                    {conv.vehicle?.brand} {conv.vehicle?.model} {conv.vehicle?.year}
                  </p>
                  
                  {conv.last_message && (
                    <p className={`text-xs truncate mt-1 ${hasUnread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      {conv.last_message.sender_type === 'seller' && 'Você: '}
                      {conv.last_message.content}
                    </p>
                  )}

                  <p className="text-[10px] text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(conv.updated_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
