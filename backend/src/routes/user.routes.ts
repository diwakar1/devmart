import { Router } from 'express';
import userController from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { idParamValidation, paginationValidation } from '../middlewares/validate.middleware';
import { body } from 'express-validator';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

// All user management routes require admin authentication
router.use(authenticate, authorize('admin'));

router.get('/', paginationValidation, userController.getAll);
router.get('/:id', idParamValidation, userController.getById);
router.patch('/:id/toggle-active', idParamValidation, userController.toggleActive);
router.patch('/:id/role', idParamValidation, [
  body('role').isIn(['user', 'admin']).withMessage('Role must be user or admin'),
  validate,
], userController.updateRole);

export default router;
