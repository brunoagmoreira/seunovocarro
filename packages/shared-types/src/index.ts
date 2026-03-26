// ============================================
// Seu Novo Carro — Tipos Compartilhados
// Usado por: @seunovocarro/web e @seunovocarro/api
// ============================================

// ---- Enums ----

export type AppRole = 'user' | 'editor' | 'admin';
export type UserStatus = 'active' | 'pending' | 'suspended';
export type VehicleStatus = 'draft' | 'pending' | 'approved' | 'sold' | 'expired';
export type Transmission = 'manual' | 'automatic' | 'cvt' | 'automated';
export type FuelType = 'flex' | 'gasoline' | 'ethanol' | 'diesel' | 'electric' | 'hybrid';
export type MediaType = 'image' | 'video';
export type SenderType = 'lead' | 'seller';
export type SortOption = 'recent' | 'price_asc' | 'price_desc' | 'mileage_asc';
export type ProposalStatus = 'pending' | 'accepted' | 'rejected' | 'counter' | 'expired';
export type CampaignStatus = 'active' | 'paused' | 'completed' | 'cancelled';
export type BlogPostStatus = 'draft' | 'published';

// ---- User / Auth ----

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  whatsapp: string | null;
  avatar_url: string | null;
  city: string | null;
  state: string | null;
  role: AppRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
  city?: string;
  state?: string;
}

// ---- Dealer ----

export interface Dealer {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  cnpj: string | null;
  description: string | null;
  address: string | null;
  logo_url: string | null;
  banner_url: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  working_hours: Record<string, string> | null;
  verified: boolean;
  featured: boolean;
  since: string | null;
  created_at: string;
}

// ---- Vehicle ----

export interface VehicleMedia {
  id: string;
  url: string;
  type: MediaType;
  order: number;
}

export interface Vehicle {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  version: string | null;
  year: number;
  mileage: number;
  transmission: Transmission;
  fuel: FuelType;
  color: string | null;
  doors: number;
  plate_ending: string | null;
  price: number;
  description: string | null;
  city: string;
  state: string;
  phone: string | null;
  whatsapp: string | null;
  status: VehicleStatus;
  slug: string;
  display_id: string | null;
  ad_code: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
  // Relations (populated by API)
  media?: VehicleMedia[];
  seller?: Pick<User, 'id' | 'full_name' | 'avatar_url' | 'city' | 'state' | 'phone' | 'whatsapp'>;
}

export interface VehicleFilters {
  brand?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  state?: string;
  city?: string;
  transmission?: Transmission;
  fuel?: FuelType;
  mileageMin?: number;
  mileageMax?: number;
}

// ---- Lead ----

export interface Lead {
  id: string;
  vehicle_id: string;
  name: string;
  phone: string;
  email: string | null;
  source: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
}

// ---- Chat ----

export interface Conversation {
  id: string;
  vehicle_id: string;
  lead_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  // Populated
  vehicle?: Pick<Vehicle, 'id' | 'brand' | 'model' | 'year'> & { images?: { url: string }[] };
  lead?: Pick<Lead, 'id' | 'name' | 'email' | 'phone'>;
  last_message?: Message;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: SenderType;
  content: string;
  read_at: string | null;
  created_at: string;
}

// ---- Proposal ----

export interface Proposal {
  id: string;
  vehicle_id: string;
  buyer_id: string | null;
  buyer_name: string;
  buyer_phone: string;
  buyer_email: string | null;
  amount: number;
  message: string | null;
  status: ProposalStatus;
  counter_amount: number | null;
  counter_message: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

// ---- Blog ----

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
  description: string | null;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  featured_image_alt: string | null;
  author_id: string | null;
  category_id: string | null;
  status: BlogPostStatus;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  reading_time_minutes: number;
  views_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  // Populated
  category?: BlogCategory;
}

// ---- Notifications ----

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  type: string;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}

// ---- Banners ----

export interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
  type: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ---- Ad Campaigns ----

export interface AdPlan {
  id: string;
  name: string;
  slug: string;
  plan_type: string;
  price: number;
  daily_budget: number;
  duration_days: number;
  min_vehicles: number;
  max_vehicles: number;
  features: unknown;
  has_individual_metrics: boolean;
  badge_text: string | null;
  badge_color: string | null;
  display_order: number;
  active: boolean;
  created_at: string;
}

export interface AdCampaign {
  id: string;
  vehicle_id: string;
  seller_id: string;
  plan_id: string | null;
  campaign_type: string;
  status: string;
  start_date: string;
  end_date: string;
  daily_budget: number;
  total_budget: number;
  days_total: number;
  amount_paid: number;
  payment_status: string;
  payment_date: string | null;
  meta_campaign_id: string | null;
  meta_adset_id: string | null;
  meta_ad_id: string | null;
  vehicle_ids: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ---- Site Settings ----

export interface SiteSettings {
  id: string;
  ga_id: string | null;
  gtm_id: string | null;
  meta_pixel_id: string | null;
  updated_at: string;
}

// ---- API Response helpers ----

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
