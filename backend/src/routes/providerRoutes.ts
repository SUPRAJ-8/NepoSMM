import { Router } from 'express';
import { getProviders, addProvider, deleteProvider, getProviderById, syncProvider, toggleProviderStatus, updateProvider } from '../controllers/providerController';
import { validate } from '../middlewares/validateMiddleware';
import { providerSchema, updateProviderSchema } from '../validations/providerValidation';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// TODO: Re-enable authentication in production
// Temporarily disabled for development access
// router.use(authenticate);

router.get('/', getProviders);
router.get('/:id', getProviderById);
router.post('/', validate(providerSchema), addProvider);
router.put('/:id', validate(updateProviderSchema), updateProvider);
router.post('/:id/sync', syncProvider);
router.patch('/:id/toggle', toggleProviderStatus);
router.delete('/:id', deleteProvider);

export default router;
