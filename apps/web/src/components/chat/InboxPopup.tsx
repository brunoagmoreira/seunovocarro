import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Maximize2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConversationList } from './ConversationList';
import { BuyerConversationList } from './BuyerConversationList';
import { ChatWindow as SellerChatWindow } from '../chat/ChatWindow';
import { BuyerChatWindow } from './BuyerChatWindow';
import { useSellerConversations, useBuyerConversations } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import type { Conversation } from '@/types/chat';

const POPUP_DISMISSED_KEY = 'inbox_dismissed';
const POPUP_SHOWN_SESSION_KEY = 'inbox_shown_session';

export function InboxPopup() {
  const { user, isEditor, isApproved, isLoading } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  
  // Determine user type
  const isSeller = isEditor && isApproved;
  
  // Fetch appropriate conversations based on user type
  const { data: sellerConversations, isLoading: sellerLoading } = useSellerConversations();
  const { data: buyerConversations, isLoading: buyerLoading } = useBuyerConversations();

  // Use seller conversations if they're a seller, otherwise buyer conversations
  const conversations = isSeller ? sellerConversations : buyerConversations;
  const conversationsLoading = isSeller ? sellerLoading : buyerLoading;

  const totalUnread = conversations?.reduce((acc, c) => acc + (c.unread_count || 0), 0) || 0;

  // Auto-show popup on first session visit if has unread messages
  useEffect(() => {
    if (isLoading) return;
    if (!user) return;

    const wasShownThisSession = sessionStorage.getItem(POPUP_SHOWN_SESSION_KEY);
    const wasDismissed = localStorage.getItem(POPUP_DISMISSED_KEY);

    // Show if not shown this session and has unread messages
    if (!wasShownThisSession && !wasDismissed && totalUnread > 0) {
      setIsOpen(true);
      sessionStorage.setItem(POPUP_SHOWN_SESSION_KEY, 'true');
    }
  }, [user, isLoading, totalUnread]);

  // Don't render for non-logged users
  if (!user) return null;

  // Don't show if no conversations exist
  const hasConversations = (conversations?.length || 0) > 0;

  const handleClose = () => {
    setIsOpen(false);
    setSelectedConversation(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(POPUP_DISMISSED_KEY, 'true');
    handleClose();
  };

  const handleOpenFull = () => {
    handleClose();
    router.push('/conversas');
  };

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  return (
    <>
      {/* Floating trigger button - only show if user has conversations or unread */}
      <AnimatePresence>
        {!isOpen && hasConversations && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50 p-4 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
          >
            <MessageCircle className="h-6 w-6" />
            {totalUnread > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center text-xs"
              >
                {totalUnread > 99 ? '99+' : totalUnread}
              </Badge>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Popup modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop - only on mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
            />

            {/* Popup window */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="
                fixed z-50 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden
                inset-4 md:inset-auto
                md:bottom-8 md:right-8 md:w-96 md:h-[500px]
                flex flex-col
              "
            >
              {/* Header */}
              <div className="shrink-0 flex items-center justify-between p-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <h3 className="font-heading font-semibold">
                    {selectedConversation ? 'Conversa' : 'Minhas Mensagens'}
                  </h3>
                  {!selectedConversation && totalUnread > 0 && (
                    <Badge variant="default" className="text-xs">
                      {totalUnread} {totalUnread === 1 ? 'nova' : 'novas'}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={handleOpenFull} title="Abrir tela cheia">
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-h-0 overflow-hidden">
                {selectedConversation ? (
                  <div className="flex flex-col h-full">
                    {/* Back button */}
                    <div className="shrink-0 p-2 border-b border-border">
                      <Button variant="ghost" size="sm" onClick={handleBackToList}>
                        ← Voltar
                      </Button>
                    </div>
                    <div className="flex-1 min-h-0">
                      {isSeller ? (
                        <SellerChatWindow conversation={selectedConversation} />
                      ) : (
                        <BuyerChatWindow conversation={selectedConversation} />
                      )}
                    </div>
                  </div>
                ) : (
                  isSeller ? (
                    <ConversationList
                      conversations={conversations || []}
                      onSelect={handleSelectConversation}
                      isLoading={conversationsLoading}
                    />
                  ) : (
                    <BuyerConversationList
                      conversations={conversations || []}
                      onSelect={handleSelectConversation}
                      isLoading={conversationsLoading}
                    />
                  )
                )}
              </div>

              {/* Footer with dismiss option */}
              {!selectedConversation && (
                <div className="shrink-0 p-3 border-t border-border bg-muted/30">
                  <button
                    onClick={handleDismiss}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center"
                  >
                    Não mostrar automaticamente
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
