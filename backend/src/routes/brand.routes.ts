import { Router } from 'express';
import brandController from '../controllers/brand.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { idParamValidation, paginationValidation } from '../middlewares/validate.middleware';
import { body } from 'express-validator';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

// Public routes
router.get('/', paginationValidation, brandController.getAll);
router.get('/slug/:slug', brandController.getBySlug);
router.get('/:id', idParamValidation, brandController.getById);

// Admin routes
router.post('/', authenticate, authorize('admin'), [
  body('name').trim().notEmpty().withMessage('Brand name is required'),
  body('description').optional().trim(),
  body('logo_url').optional().isURL(),
  body('website_url').optional().isURL(),
  validate,
], brandController.create);

router.put('/:id', authenticate, authorize('admin'), idParamValidation, brandController.update);
router.delete('/:id', authenticate, authorize('admin'), idParamValidation, brandController.delete);

export default router;
