// ============================================
// Shared Enums & Literal Types for DevMart
// ============================================

export type UserRole = 'user' | 'admin';

export type AddressType = 'billing' | 'shipping' | 'both';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentMethod = 'credit_card' | 'debit_card' | 'paypal' | 'stripe' | 'cash_on_delivery';

export type PaymentResultStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type DiscountType = 'percentage' | 'fixed_amount' | 'free_shipping';

export type CouponApplicableTo = 'all' | 'category' | 'product' | 'brand';

export type NotificationType = 'order' | 'product' | 'promotion' | 'account' | 'system';
