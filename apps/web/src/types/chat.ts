export interface Conversation {
  id: string;
  vehicle_id: string;
  lead_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  // Joined data
  unread_count?: number;
  last_message?: Message;
  vehicle?: {
    id: string;
    brand: string;
    model: string;
    year: number;
    slug: string;
    media: { url: string }[];
    images?: { url: string }[];
  };
  lead?: {
    id: string;
    name: string;
    phone: string;
  };
  seller?: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  messages?: Message[];
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'lead' | 'seller' | 'buyer';
  content: string;
  read_at: string | null;
  created_at: string;
}
