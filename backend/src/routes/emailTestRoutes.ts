import express from 'express';
import {
    getEmailTemplates,
    previewEmailTemplate,
    sendTestEmail,
} from '../controllers/emailTestController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize(['admin']));

// Get all available email templates
router.get('/templates', getEmailTemplates);

// Preview email template with sample data
router.post('/preview', previewEmailTemplate);

// Send test email
router.post('/send-test', sendTestEmail);

export default router;
