"use client";

import { useState } from 'react';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useSellerConversations } from '@/hooks/useChat';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Conversation } from '@/types/chat';

export function ChatsClient() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const { data: conversations, isLoading } = useSellerConversations();
  const isMobile = useIsMobile();

  // Mobile: show either list or chat
  const showList = !isMobile || !selectedConversation;
  const showChat = !isMobile || selectedConversation;

  return (
    <div className="min-h-screen pt-16">
      <div className="container py-6">
        <div className="flex items-center gap-4 mb-6">
          {isMobile && selectedConversation && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedConversation(null)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl gradient-kairos-soft">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <h1 className="font-heading text-2xl font-bold">
              {isMobile && selectedConversation 
                ? selectedConversation.lead?.name || 'Chat'
                : 'Minhas Conversas'
              }
            </h1>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          <div className="flex h-[calc(100vh-200px)] min-h-[500px]">
            {/* Conversation List */}
            {showList && (
              <div className={`${isMobile ? 'w-full' : 'w-80'} border-r border-border`}>
                <div className="p-4 border-b">
                  <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Conversas ({conversations?.length || 0})
                  </h2>
                </div>
                <ConversationList
                  conversations={conversations || []}
                  selectedId={selectedConversation?.id}
                  onSelect={setSelectedConversation}
                  isLoading={isLoading}
                />
              </div>
            )}

            {/* Chat Window */}
            {showChat && (
              <div className={`flex-1 ${isMobile && !selectedConversation ? 'hidden' : ''}`}>
                <ChatWindow conversation={selectedConversation} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
