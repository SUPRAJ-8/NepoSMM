import { Request, Response } from 'express';
import { sendEmail } from '../utils/mailer';
import {
    getSignUpEmailTemplate,
    getPasswordResetTemplate,
    getFundsAddedTemplate,
} from '../utils/emailTemplates';
import logger from '../utils/logger';

// Get list of all available email templates
export const getEmailTemplates = async (req: Request, res: Response) => {
    console.log('--- GET TEMPLATES CALLED ---');
    try {
        const templates = [
            {
                id: 'signup',
                name: '!!! Sign Up Email !!!',
                description: 'Premium welcome email sent to new users after registration',
                requiredFields: ['username', 'email'],
            },
            {
                id: 'password-reset',
                name: 'Password Reset',
                description: 'Secure link for users to reset their forgotten password',
                requiredFields: ['resetLink'],
            },
            {
                id: 'funds-added',
                name: 'Funds Added',
                description: 'Notification sent when balance is successfully topped up',
                requiredFields: ['username', 'amount', 'newBalance'],
            },
        ];

        res.json(templates);
    } catch (error) {
        logger.error('Error fetching email templates:', error);
        res.status(500).json({ error: 'Failed to fetch email templates' });
    }
};

// Preview email template with sample data
export const previewEmailTemplate = async (req: Request, res: Response) => {
    try {
        const { templateId, data } = req.body;

        let html = '';
        let subject = '';

        switch (templateId) {
            case 'signup':
                subject = 'Welcome to Nepo SMM! 🎉';
                html = getSignUpEmailTemplate(
                    data.username || 'John Doe',
                    data.email || 'john.doe@example.com'
                );
                break;

            case 'password-reset':
                subject = 'Reset Your Password';
                html = getPasswordResetTemplate(
                    data.resetLink || 'https://example.com/reset-password?token=sample123'
                );
                break;

            case 'funds-added':
                subject = 'Funds Added Successfully! 💰';
                html = getFundsAddedTemplate(
                    data.username || 'John Doe',
                    data.amount || '$50.00',
                    data.newBalance || '$150.00'
                );
                break;

            default:
                return res.status(400).json({ error: 'Invalid template ID' });
        }

        res.json({ subject, html });
    } catch (error) {
        logger.error('Error previewing email template:', error);
        res.status(500).json({ error: 'Failed to preview email template' });
    }
};

// Send test email
export const sendTestEmail = async (req: Request, res: Response) => {
    try {
        const { templateId, data, testEmail } = req.body;

        if (!testEmail) {
            return res.status(400).json({ error: 'Test email address is required' });
        }

        let html = '';
        let subject = '';

        switch (templateId) {
            case 'signup':
                subject = '[TEST] Welcome to Nepo SMM! 🎉';
                html = getSignUpEmailTemplate(
                    data.username || 'John Doe',
                    data.email || 'john.doe@example.com'
                );
                break;

            case 'password-reset':
                subject = '[TEST] Reset Your Password';
                html = getPasswordResetTemplate(
                    data.resetLink || 'https://example.com/reset-password?token=sample123'
                );
                break;

            case 'funds-added':
                subject = '[TEST] Funds Added Successfully! 💰';
                html = getFundsAddedTemplate(
                    data.username || 'John Doe',
                    data.amount || '$50.00',
                    data.newBalance || '$150.00'
                );
                break;

            default:
                return res.status(400).json({ error: 'Invalid template ID' });
        }

        const sent = await sendEmail(testEmail, subject, '', html);

        if (sent) {
            logger.info(`Test email sent to ${testEmail} for template ${templateId}`);
            res.json({ success: true, message: 'Test email sent successfully' });
        } else {
            res.status(500).json({ error: 'Failed to send test email. Check email configuration.' });
        }
    } catch (error) {
        logger.error('Error sending test email:', error);
        res.status(500).json({ error: 'Failed to send test email' });
    }
};
