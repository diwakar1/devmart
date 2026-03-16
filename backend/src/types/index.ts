import { Request } from 'express';
import { RowDataPacket } from 'mysql2/promise';

// ============================================
// Re-export everything from the shared package
// so existing imports from '../types' keep working
// ============================================
export {
  // Enums / literal types
  type UserRole,
  type AddressType,
  type OrderStatus,
  type PaymentStatus,
  type PaymentMethod,
  type PaymentResultStatus,
  type DiscountType,
  type CouponApplicableTo,
  type NotificationType,

  // Shared pure interfaces (for consumers that don't need RowDataPacket)
  type User,
  type UserPublic,
  type Address,
  type RefreshToken,
  type TokenPayload,
  type AuthTokens,
  type Product,
  type Category,
  type Brand,
  type ProductImage,
  type ProductAttribute,
  type ProductVariant,
  type Review,
  type Cart,
  type CartItem,
  type Order,
  type OrderItem,
  type Payment,
  type Coupon,
  type Notification,
  type Wishlist,

  // DTOs
  type ApiResponse,
  type PaginatedResponse,
  type PaginationMeta,
  type PaginationQuery,
  type ProductFilterQuery,
  type RegisterRequest,
  type LoginRequest,
  type ChangePasswordRequest,
  type UpdateProfileRequest,
  type AddToCartRequest,
  type UpdateCartItemRequest,
  type CreateOrderRequest,
  type CreateAddressRequest,
  type CreateReviewRequest,
  type GuestCheckoutRequest,
} from '../../../shared/src';

// ============================================
// Import shared interfaces so we can extend them
// ============================================
import type {
  User,
  Address,
  RefreshToken,
  TokenPayload,
  Product,
  Category,
  Brand,
  ProductImage,
  ProductAttribute,
  ProductVariant,
  Review,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Payment,
  Coupon,
  Notification,
  Wishlist,
} from '../../../shared/src';

// ============================================
// Backend-specific DB row types (extend RowDataPacket
// so mysql2 query results can be typed directly)
// ============================================

export interface IUser extends RowDataPacket, User {}
export interface IUserPublic extends User {}   // no RowDataPacket — projection only
export interface IAddress extends RowDataPacket, Address {}
export interface IRefreshToken extends RowDataPacket, RefreshToken {}
export interface ITokenPayload extends TokenPayload {}
export interface IAuthTokens { accessToken: string; refreshToken: string; }

export interface IProduct extends RowDataPacket, Product {}
export interface ICategory extends RowDataPacket, Category {}
export interface IBrand extends RowDataPacket, Brand {}
export interface IProductImage extends RowDataPacket, ProductImage {}
export interface IProductAttribute extends RowDataPacket, ProductAttribute {}
export interface IProductVariant extends RowDataPacket, ProductVariant {}
export interface IReview extends RowDataPacket, Review {}
export interface ICart extends RowDataPacket, Cart {}
export interface ICartItem extends RowDataPacket, CartItem {}
export interface IOrder extends RowDataPacket, Order {}
export interface IOrderItem extends RowDataPacket, OrderItem {}
export interface IPayment extends RowDataPacket, Payment {}
export interface ICoupon extends RowDataPacket, Coupon {}
export interface INotification extends RowDataPacket, Notification {}
export interface IWishlist extends RowDataPacket, Wishlist {}

// ============================================
// Backend-only Request Type
// ============================================

export interface AuthRequest extends Request {
  user?: ITokenPayload;
}
