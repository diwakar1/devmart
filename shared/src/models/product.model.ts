// ============================================
// Product Models
// ============================================

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  sku: string;
  brand_id: number | null;
  price: number;
  discount_price: number | null;
  cost_price: number | null;
  stock_quantity: number;
  low_stock_threshold: number;
  weight: number | null;
  dimensions: string | null;
  is_active: boolean;
  is_featured: boolean;
  is_new: boolean;
  view_count: number;
  avg_rating: number | null;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  alt_text: string | null;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

export interface ProductAttribute {
  id: number;
  product_id: number;
  attribute_name: string;
  attribute_value: string;
  display_order: number;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  variant_name: string;
  sku: string;
  price: number | null;
  discount_price: number | null;
  stock_quantity: number;
  attributes: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
