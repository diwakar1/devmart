import { body, param, query } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ValidationError } from '../utils/ApiError';

// Run validation and throw error if failed
export const validate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field: (err as { path?: string }).path || 'unknown',
      message: err.msg,
    }));
    next(new ValidationError('Validation failed', errorMessages));
    return;
  }
  next();
};

// ============================================
// Auth Validators
// ============================================

export const registerValidation = [
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),
  body('first_name')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ max: 100 }).withMessage('First name must be under 100 characters'),
  body('last_name')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ max: 100 }).withMessage('Last name must be under 100 characters'),
  body('phone')
    .optional()
    .isMobilePhone('any').withMessage('Please provide a valid phone number'),
  validate,
];

export const loginValidation = [
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validate,
];

// ============================================
// Product Validators
// ============================================

export const productValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ max: 500 }).withMessage('Product name must be under 500 characters'),
  body('description')
    .optional()
    .trim(),
  body('short_description')
    .optional()
    .isLength({ max: 1000 }).withMessage('Short description must be under 1000 characters'),
  body('sku')
    .trim()
    .notEmpty().withMessage('SKU is required')
    .isLength({ max: 100 }).withMessage('SKU must be under 100 characters'),
  body('price')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('discount_price')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('Discount price must be a positive number'),
  body('stock_quantity')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
  body('brand_id')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('Brand ID must be a positive integer'),
  validate,
];

// ============================================
// Order Validators
// ============================================

export const createOrderValidation = [
  body('shipping_address_id')
    .isInt({ min: 1 }).withMessage('Shipping address is required'),
  body('billing_address_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Billing address ID must be a positive integer'),
  body('payment_method')
    .isIn(['credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery'])
    .withMessage('Invalid payment method'),
  body('card_number')
    .optional()
    .trim(),
  body('customer_notes')
    .optional()
    .trim(),
  body('coupon_code')
    .optional()
    .trim(),
  validate,
];

export const guestOrderValidation = [
  body('items')
    .isArray({ min: 1 }).withMessage('Cart must have at least one item'),
  body('items.*.product_id')
    .isInt({ min: 1 }).withMessage('Product ID is required'),
  body('items.*.quantity')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('shipping_address.full_name')
    .trim()
    .notEmpty().withMessage('Full name is required'),
  body('shipping_address.email')
    .isEmail().withMessage('Valid email is required'),
  body('shipping_address.phone')
    .trim()
    .notEmpty().withMessage('Phone is required'),
  body('shipping_address.address_line1')
    .trim()
    .notEmpty().withMessage('Address is required'),
  body('shipping_address.city')
    .trim()
    .notEmpty().withMessage('City is required'),
  body('shipping_address.state')
    .trim()
    .notEmpty().withMessage('State is required'),
  body('shipping_address.postal_code')
    .trim()
    .notEmpty().withMessage('Postal code is required'),
  body('payment_method')
    .isIn(['credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery'])
    .withMessage('Invalid payment method'),
  body('card_number')
    .optional()
    .trim(),
  body('customer_notes')
    .optional()
    .trim(),
  body('coupon_code')
    .optional()
    .trim(),
  validate,
];

// ============================================
// Address Validators
// ============================================

export const addressValidation = [
  body('address_type')
    .optional()
    .isIn(['billing', 'shipping', 'both']).withMessage('Invalid address type'),
  body('full_name')
    .trim()
    .notEmpty().withMessage('Full name is required'),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone is required'),
  body('address_line1')
    .trim()
    .notEmpty().withMessage('Address line 1 is required'),
  body('address_line2').optional().trim(),
  body('city')
    .trim()
    .notEmpty().withMessage('City is required'),
  body('state')
    .trim()
    .notEmpty().withMessage('State is required'),
  body('postal_code')
    .trim()
    .notEmpty().withMessage('Postal code is required'),
  body('country')
    .optional()
    .trim(),
  body('is_default')
    .optional()
    .isBoolean().withMessage('is_default must be a boolean'),
  validate,
];

// ============================================
// Review Validators
// ============================================

export const reviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Title must be under 255 characters'),
  body('comment')
    .optional()
    .trim(),
  validate,
];

// ============================================
// Common Validators
// ============================================

export const idParamValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid ID'),
  validate,
];

export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isString(),
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC']).withMessage('Sort order must be ASC or DESC'),
  validate,
];
