import { DiscountType, CouponApplicableTo } from '../enums';

// ============================================
// Coupon Model
// ============================================

export interface Coupon {
  id: number;
  code: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number;
  min_purchase_amount: number | null;
  max_discount_amount: number | null;
  usage_limit: number | null;
  usage_limit_per_user: number;
  used_count: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  applicable_to: CouponApplicableTo;
  applicable_ids: string | null;
  created_at: string;
  updated_at: string;
}
