import { OrderStatus, PaymentStatus, PaymentMethod, PaymentResultStatus } from '../enums';

// ============================================
// Order Models
// ============================================

export interface Order {
  id: number;
  order_number: string;
  user_id: number | null;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  shipping_address_id: number | null;
  billing_address_id: number | null;
  shipping_method: string | null;
  shipping_provider: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  estimated_delivery_date: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  customer_notes: string | null;
  admin_notes: string | null;
  guest_email: string | null;
  guest_name: string | null;
  guest_phone: string | null;
  shipping_address_data: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  variant_id: number | null;
  product_name: string;
  product_sku: string;
  variant_info: string | null;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  total_price: number;
  created_at: string;
}

export interface Payment {
  id: number;
  order_id: number;
  payment_method: PaymentMethod;
  transaction_id: string | null;
  amount: number;
  currency: string;
  status: PaymentResultStatus;
  payment_gateway_response: string | null;
  created_at: string;
  updated_at: string;
}
