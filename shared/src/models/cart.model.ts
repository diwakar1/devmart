// ============================================
// Cart Models
// ============================================

export interface Cart {
  id: number;
  user_id: number | null;
  session_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  variant_id: number;
  quantity: number;
  price_snapshot: number;
  created_at: string;
  updated_at: string;
}
