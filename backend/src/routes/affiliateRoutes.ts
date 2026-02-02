import express from 'express';
import {
    getAffiliateStats,
    getAllPayoutRequests,
    updatePayoutStatus,
    getReferralLogs,
    createPayoutRequest,
    getUserAffiliateStats,
    recordVisit
} from '../controllers/affiliateController';

import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

// Public
router.post('/visit', recordVisit);

// Admin Only
router.get('/stats', authenticate, authorize(['admin']), getAffiliateStats);
router.get('/payouts', authenticate, authorize(['admin']), getAllPayoutRequests);
router.put('/payouts/:id', authenticate, authorize(['admin']), updatePayoutStatus);
router.get('/logs', authenticate, authorize(['admin']), getReferralLogs);

// User & Admin
router.post('/request', authenticate, createPayoutRequest);
router.get('/user/:userId/stats', authenticate, getUserAffiliateStats);

export default router;
