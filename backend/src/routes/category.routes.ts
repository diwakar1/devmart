import { Router } from 'express';
import categoryController from '../controllers/category.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { idParamValidation } from '../middlewares/validate.middleware';
import { body } from 'express-validator';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

// Public routes
router.get('/', categoryController.getAll);
router.get('/slug/:slug', categoryController.getBySlug);
router.get('/:id', idParamValidation, categoryController.getById);

// Admin routes
router.post('/', authenticate, authorize('admin'), [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('description').optional().trim(),
  body('parent_id').optional().isInt({ min: 1 }),
  body('image_url').optional().isURL(),
  body('display_order').optional().isInt({ min: 0 }),
  validate,
], categoryController.create);

router.put('/:id', authenticate, authorize('admin'), idParamValidation, categoryController.update);
router.delete('/:id', authenticate, authorize('admin'), idParamValidation, categoryController.delete);

export default router;
