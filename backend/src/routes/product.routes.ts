import { Router } from 'express';
import productController from '../controllers/product.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { productValidation, idParamValidation, paginationValidation } from '../middlewares/validate.middleware';

const router = Router();

// Public routes
router.get('/', paginationValidation, productController.getAll);
router.get('/featured', productController.getFeatured);
router.get('/new-arrivals', productController.getNewArrivals);
router.get('/slug/:slug', productController.getBySlug);
router.get('/:id/related', productController.getRelated);
router.get('/:id', idParamValidation, productController.getById);

// Admin routes
router.post('/', authenticate, authorize('admin'), productValidation, productController.create);
router.put('/:id', authenticate, authorize('admin'), idParamValidation, productController.update);
router.delete('/:id', authenticate, authorize('admin'), idParamValidation, productController.delete);

export default router;
