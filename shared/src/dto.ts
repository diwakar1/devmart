// ============================================
// API Response DTOs — shared between frontend & backend
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T> {
  pagination: PaginationMeta;
}

// ============================================
// Query / Filter DTOs
// ============================================

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface ProductFilterQuery extends PaginationQuery {
  search?: string;
  category?: number;
  brand?: number;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  isNew?: boolean;
  inStock?: boolean;
}

// ============================================
// Auth Request DTOs
// ============================================

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
}

// ============================================
// Cart Request DTOs
// ============================================

export interface AddToCartRequest {
  product_id: number;
  variant_id?: number;
  quantity?: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// ============================================
// Order Request DTOs
// ============================================

export interface CreateOrderRequest {
  shipping_address_id: number;
  billing_address_id?: number;
  payment_method: string;
  card_number?: string;
  customer_notes?: string;
  coupon_code?: string;
}

export interface GuestCheckoutRequest {
  items: { product_id: number; variant_id?: number | null; quantity: number }[];
  shipping_address: {
    full_name: string;
    email: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country?: string;
  };
  payment_method: string;
  card_number?: string;
  customer_notes?: string;
  coupon_code?: string;
}

// ============================================
// Address Request DTOs
// ============================================

export interface CreateAddressRequest {
  address_type?: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
  is_default?: boolean;
}

// ============================================
// Review Request DTOs
// ============================================

export interface CreateReviewRequest {
  rating: number;
  title?: string;
  comment?: string;
}
