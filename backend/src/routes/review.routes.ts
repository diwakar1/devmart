import { Router } from 'express';
import reviewController from '../controllers/review.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { reviewValidation, idParamValidation, paginationValidation } from '../middlewares/validate.middleware';
import { param } from 'express-validator';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

// Public routes
router.get('/product/:productId', [
  param('productId').isInt({ min: 1 }),
  validate,
  ...paginationValidation,
], reviewController.getProductReviews);

// Protected routes
router.post('/product/:productId', authenticate, [
  param('productId').isInt({ min: 1 }),
  validate,
], reviewValidation, reviewController.create);

router.put('/:id', authenticate, idParamValidation, reviewController.update);
router.delete('/:id', authenticate, idParamValidation, reviewController.delete);
router.post('/:id/helpful', authenticate, idParamValidation, reviewController.voteHelpful);

export default router;
