import { createClient } from '@supabase/supabase-js';

// Create Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Re-export types for convenience
export type Category = {
  id: number;
  name: string;
  order_position: number;
  active: boolean;
};

export type Product = {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  price_small: number | null;
  price_medium: number | null;
  price_large: number | null;
  image_url: string | null;
  active: boolean;
  created_at: string;
};

export type Store = {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  opening_hours: string | null;
  closing_hours: string | null;
  active: boolean;
  is_delivery: boolean;
  lat: number | null;
  lng: number | null;
  allows_delivery: boolean;
  allows_pickup: boolean;
  allows_reservation: boolean;
  allows_dine_in: boolean;
  whatsapp_number: string;
  whatsapp_message: string;
  login_username: string | null;
  login_password_hash: string | null;
  max_reservations: number;
  max_reservation_guests: number;
  max_reservations_per_slot: number;
};

export type Setting = {
  id: number;
  key: string;
  value: string;
};

export type Order = {
  id: number;
  store_id: number;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  customer_address: string | null;
  order_type: 'delivery' | 'pickup' | 'dine_in';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  total: number;
  delivery_fee: number;
  payment_method: string;
  change_for: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  size: string | null;
  quantity: number;
  unit_price: number;
  notes: string | null;
};

export type Reservation = {
  id: number;
  store_id: number;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  date: string;
  time: string;
  guests: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string | null;
  created_at: string;
};

export type Promotion = {
  id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  discount_percent: number | null;
  discount_value: number | null;
  promo_code: string | null;
  start_date: string;
  end_date: string;
  active: boolean;
  banner_color: string;
  created_at: string;
};

export type AdminUser = {
  id: number;
  username: string;
  password_hash: string;
  name: string;
  role: string;
  created_at: string;
};

export type Session = {
  id: number;
  token: string;
  user_type: 'admin' | 'store';
  user_id: number;
  created_at: string;
  expires_at: string;
};

// Export default for backwards compatibility
export default supabase;
