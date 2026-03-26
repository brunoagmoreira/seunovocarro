export interface Conversation {
  id: string;
  vehicle_id: string;
  lead_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  // Joined data
  vehicle?: {
    id: string;
    brand: string;
    model: string;
    year: number;
    images: { url: string }[];
  };
  lead?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  seller?: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  last_message?: Message;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'lead' | 'seller';
  content: string;
  read_at: string | null;
  created_at: string;
}
