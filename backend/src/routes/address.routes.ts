import { Router } from 'express';
import addressController from '../controllers/address.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { addressValidation, idParamValidation } from '../middlewares/validate.middleware';

const router = Router();

// All address routes require authentication
router.use(authenticate);

router.get('/', addressController.getAll);
router.get('/:id', idParamValidation, addressController.getById);
router.post('/', addressValidation, addressController.create);
router.put('/:id', idParamValidation, addressController.update);
router.delete('/:id', idParamValidation, addressController.delete);
router.patch('/:id/default', idParamValidation, addressController.setDefault);

export default router;
