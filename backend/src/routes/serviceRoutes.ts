import { Router } from 'express';
import { getServices, updateService, deleteService, getCategories, toggleCategoryStatus, renameCategory, toggleServiceStatus, bulkUpdateMargin, getServiceById, updateCategorySortOrder } from '../controllers/serviceController';
import { validate } from '../middlewares/validateMiddleware';
import { serviceSchema, bulkMarginSchema, toggleStatusSchema } from '../validations/serviceValidation';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Public routes
router.get('/', getServices);
router.get('/categories', getCategories);
router.get('/:id', getServiceById);

// Protected routes (Mutations)
// TODO: Re-enable authentication in production
// router.use(authenticate);

router.put('/:id', validate(serviceSchema.partial()), updateService);
router.delete('/:id', deleteService);
router.post('/bulk-margin', validate(bulkMarginSchema), bulkUpdateMargin);
router.post('/categories/toggle', toggleCategoryStatus);
router.post('/categories/sort', updateCategorySortOrder);
router.put('/categories/rename', renameCategory);
router.patch('/:id/toggle', validate(toggleStatusSchema), toggleServiceStatus);

export default router;
