import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { socketService } from '@/lib/socket';
import { Conversation, Message } from '@/types/chat';

export function useConversation(vehicleId: string | undefined, forceNewSession?: string) {
  return useQuery({
    queryKey: ['chat', 'conversation', vehicleId, forceNewSession],
    queryFn: async () => {
      if (!vehicleId) return null;
      try {
        const params = forceNewSession ? { forceNew: forceNewSession } : {};
        return await fetchApi<Conversation>(`/chat/conversations/init/${vehicleId}`, { params });
      } catch (err: any) {
        if (err.message.includes('404')) return null;
        throw err;
      }
    },
    enabled: !!vehicleId,
    staleTime: 60000,
  });
}

export function useSellerConversations() {
  return useQuery({
    queryKey: ['chat', 'seller_conversations'],
    queryFn: async () => {
      return await fetchApi<Conversation[]>('/chat/conversations/seller', { requireAuth: true });
    },
    staleTime: 30000,
  });
}

export function useBuyerConversations() {
  return useQuery({
    queryKey: ['chat', 'buyer_conversations'],
    queryFn: async () => {
      return await fetchApi<Conversation[]>('/chat/conversations/buyer', { requireAuth: true });
    },
    staleTime: 30000,
  });
}

export function useMessages(conversationId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['chat', 'messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      return await fetchApi<Message[]>(`/chat/conversations/${conversationId}/messages`, { requireAuth: true });
    },
    enabled: !!conversationId,
  });

  // Socket.io Realtime Listener
  useEffect(() => {
    if (!conversationId) return;

    const socket = socketService.connect();
    
    // Join the specific conversation room
    socket.emit('joinConversation', conversationId);

    const handleNewMessage = (newMessage: Message) => {
      queryClient.setQueryData<Message[]>(['chat', 'messages', conversationId], (oldData) => {
        if (!oldData) return [newMessage];
        // avoid duplicates
        if (oldData.some(m => m.id === newMessage.id)) return oldData;
        return [...oldData, newMessage];
      });
      // Optionally invalidate conversation list to update unseen counts
      queryClient.invalidateQueries({ queryKey: ['chat', 'seller_conversations'] });
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.emit('leaveConversation', conversationId);
    };
  }, [conversationId, queryClient]);

  return query;
}

export async function sendMessage(conversationId: string, content: string, senderType: 'lead' | 'seller') {
  return await fetchApi<Message>(`/chat/conversations/${conversationId}/messages`, {
    method: 'POST',
    requireAuth: true,
    body: JSON.stringify({ content, senderType }),
  });
}

export async function markMessagesAsRead(conversationId: string) {
  return await fetchApi(`/chat/conversations/${conversationId}/read`, {
    method: 'PUT',
    requireAuth: true,
  });
}

export function useConversationMessages(conversationId: string | undefined) {
  return useMessages(conversationId);
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ conversationId, content, senderType }: { conversationId: string; content: string; senderType: 'lead' | 'seller' }) => {
      return await sendMessage(conversationId, content, senderType);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'seller_conversations'] });
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (conversationId: string) => {
      return await markMessagesAsRead(conversationId);
    },
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'seller_conversations'] });
    },
  });
}

export const useChatSubscription = (id?: string | null, cb?: (payload: any) => void) => {
  useEffect(() => {
    if (!id || !cb) return;

    const socket = socketService.connect();
    socket.emit('joinConversation', id);

    const handleMessage = (payload: any) => {
      cb(payload);
    };

    socket.on('newMessage', handleMessage);

    return () => {
      socket.off('newMessage', handleMessage);
      socket.emit('leaveConversation', id);
    };
  }, [id, cb]);
};
