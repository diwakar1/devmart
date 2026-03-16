import { Router } from 'express';
import cartController from '../controllers/cart.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { body, param } from 'express-validator';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

// All cart routes require authentication
router.use(authenticate);

router.get('/', cartController.getCart);

router.post('/items', [
  body('product_id').isInt({ min: 1 }).withMessage('Product ID is required'),
  body('variant_id').optional().isInt({ min: 0 }),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  validate,
], cartController.addItem);

router.put('/items/:itemId', [
  param('itemId').isInt({ min: 1 }),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  validate,
], cartController.updateItem);

router.delete('/items/:itemId', [
  param('itemId').isInt({ min: 1 }),
  validate,
], cartController.removeItem);

router.delete('/', cartController.clearCart);

export default router;
