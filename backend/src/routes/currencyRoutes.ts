import { Router } from 'express';
import { getRates, updateRate } from '../controllers/currencyController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Public route to view rates (or protected if you prefer)
router.get('/', getRates);

// Protected routes (Mutations)
// TODO: Re-enable authentication in production
// router.use(authenticate);

router.post('/update', updateRate);

export default router;
