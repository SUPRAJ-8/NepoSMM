import { Router } from 'express';
import {
    getPaymentMethods,
    getPaymentMethodById,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    reorderPaymentMethods
} from '../controllers/paymentMethodController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

// Public routes (or authenticated user routes)
router.get('/', getPaymentMethods); // Users need to see methods
router.get('/:id', getPaymentMethodById);

// Admin only routes
router.post('/', authenticate, authorize(['admin']), createPaymentMethod);
router.post('/reorder', authenticate, authorize(['admin']), reorderPaymentMethods);
router.put('/:id', authenticate, authorize(['admin']), updatePaymentMethod);
router.delete('/:id', authenticate, authorize(['admin']), deletePaymentMethod);

export default router;
