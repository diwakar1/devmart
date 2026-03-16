import { Router } from 'express';
import wishlistController from '../controllers/wishlist.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { param } from 'express-validator';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

// All wishlist routes require authentication
router.use(authenticate);

router.get('/', wishlistController.getAll);

router.post('/:productId', [
  param('productId').isInt({ min: 1 }),
  validate,
], wishlistController.add);

router.delete('/:productId', [
  param('productId').isInt({ min: 1 }),
  validate,
], wishlistController.remove);

router.get('/check/:productId', [
  param('productId').isInt({ min: 1 }),
  validate,
], wishlistController.check);

export default router;
