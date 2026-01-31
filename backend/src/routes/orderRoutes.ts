import { Router } from 'express';
import { createOrder, getUserOrders, getAllOrders, refreshOrder, cancelOrder, refillOrder } from '../controllers/orderController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/:id/refresh', refreshOrder);
router.put('/:id/cancel', cancelOrder);
router.put('/:id/refill', refillOrder);

// Admin only routes
router.get('/all', authorize(['admin']), getAllOrders);

export default router;
