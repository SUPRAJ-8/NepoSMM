import express from 'express';
import {
    getContactLinks,
    updateContactLinks,
    getPublicContactLinks,
    getAffiliateSettings,
    updateAffiliateSettings
} from '../controllers/settingsController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

// Get (public) contact links
router.get('/public-contact-links', getPublicContactLinks);

// Get contact links (admin only)
router.get('/contact-links', authenticate, authorize(['admin']), getContactLinks);

// Update contact links (admin only)
router.put('/contact-links', authenticate, authorize(['admin']), updateContactLinks);

// Affiliate settings (admin only)
router.get('/affiliate', authenticate, authorize(['admin']), getAffiliateSettings);
router.put('/affiliate', authenticate, authorize(['admin']), updateAffiliateSettings);

export default router;
