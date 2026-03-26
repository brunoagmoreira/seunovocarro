import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { fetchApi } from '@/lib/api';

export interface Notification {
  id: string;
  user_id: string;
  type: 'new_message' | 'new_lead' | 'vehicle_approved' | 'vehicle_rejected' | 'new_proposal';
  title: string;
  body: string | null;
  data: Record<string, any> | null;
  read_at: string | null;
  created_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  
  const query = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async (): Promise<Notification[]> => {
      if (!user) return [];
      return await fetchApi<Notification[]>('/notifications', { requireAuth: true });
    },
    enabled: !!user,
    refetchInterval: 10000, 
    // Fallback polling replaced supabase real-time changes temporarily ahead of full Socket.io adoption
  });

  const unreadCount = query.data?.filter(n => !n.read_at).length || 0;

  return { ...query, unreadCount };
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      return await fetchApi(`/notifications/${notificationId}/read`, {
        method: 'PATCH',
        requireAuth: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      return await fetchApi(`/notifications/read-all`, {
        method: 'PATCH',
        requireAuth: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });
}
