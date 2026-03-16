import { Router } from 'express';
import orderController from '../controllers/order.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { createOrderValidation, guestOrderValidation, idParamValidation, paginationValidation } from '../middlewares/validate.middleware';
import { body } from 'express-validator';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

// Guest checkout (no auth required) — must come BEFORE router.use(authenticate)
router.post('/guest', guestOrderValidation, orderController.guestCheckout);

// Guest order tracking (no auth required)
router.post('/track', [
  body('order_number').trim().notEmpty().withMessage('Order number is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  validate,
], orderController.trackOrder);

// Token-based tracking (from email link)
router.get('/track/:token', orderController.trackByToken);

// All other order routes require authentication
router.use(authenticate);

// User routes
router.post('/', createOrderValidation, orderController.create);
router.get('/', paginationValidation, orderController.getUserOrders);
router.get('/:id', idParamValidation, orderController.getById);
router.post('/:id/cancel', idParamValidation, orderController.cancel);

// Admin routes
router.get('/admin/all', authorize('admin'), paginationValidation, orderController.getAllOrders);
router.patch('/:id/status', authorize('admin'), idParamValidation, [
  body('status')
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
    .withMessage('Invalid status'),
  body('notes').optional().trim(),
  validate,
], orderController.updateStatus);
router.patch('/:id/tracking', authorize('admin'), idParamValidation, orderController.updateTracking);

export default router;
