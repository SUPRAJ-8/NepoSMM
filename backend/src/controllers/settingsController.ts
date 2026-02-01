import { Request, Response } from 'express';
import pool from '../config/db';

export const getPublicContactLinks = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            'SELECT * FROM settings WHERE key IN ($1, $2, $3, $4, $5)',
            ['whatsapp_number', 'tawk_token', 'telegram_username', 'affiliate_commission_percentage', 'support_email']
        );

        const contactLinks: any = {
            whatsapp_number: '',
            tawk_token: '',
            telegram_username: '',
            affiliate_commission_percentage: '2',
            support_email: 'support@neposmm.com'
        };

        result.rows.forEach(row => {
            contactLinks[row.key] = row.value;
        });

        res.json(contactLinks);
    } catch (error) {
        console.error('Error fetching public contact links:', error);
        res.status(500).json({ error: 'Failed to fetch contact links' });
    }
};

export const getContactLinks = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            'SELECT * FROM settings WHERE key IN ($1, $2, $3, $4)',
            ['whatsapp_number', 'tawk_token', 'telegram_username', 'support_email']
        );

        const contactLinks: any = {
            whatsapp_number: '',
            tawk_token: '',
            telegram_username: '',
            support_email: ''
        };

        result.rows.forEach(row => {
            contactLinks[row.key] = row.value;
        });

        res.json(contactLinks);
    } catch (error) {
        console.error('Error fetching contact links:', error);
        res.status(500).json({ error: 'Failed to fetch contact links' });
    }
};

export const updateContactLinks = async (req: Request, res: Response) => {
    try {
        const { whatsapp_number, tawk_token, telegram_username, support_email } = req.body;

        // Update or insert each setting
        const settings = [
            { key: 'whatsapp_number', value: whatsapp_number || '' },
            { key: 'tawk_token', value: tawk_token || '' },
            { key: 'telegram_username', value: telegram_username || '' },
            { key: 'support_email', value: support_email || '' }
        ];

        for (const setting of settings) {
            await pool.query(
                `INSERT INTO settings (key, value, updated_at)
                 VALUES ($1, $2, NOW())
                 ON CONFLICT (key)
                 DO UPDATE SET value = $2, updated_at = NOW()`,
                [setting.key, setting.value]
            );
        }

        res.json({
            message: 'Contact links updated successfully',
            whatsapp_number,
            tawk_token,
            telegram_username,
            support_email
        });
    } catch (error) {
        console.error('Error updating contact links:', error);
        res.status(500).json({ error: 'Failed to update contact links' });
    }
};

export const getAffiliateSettings = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            'SELECT * FROM settings WHERE key = $1',
            ['affiliate_commission_percentage']
        );

        const commission = result.rows[0]?.value || '2'; // Default to 2% if not set
        res.json({ affiliate_commission_percentage: commission });
    } catch (error) {
        console.error('Error fetching affiliate settings:', error);
        res.status(500).json({ error: 'Failed to fetch affiliate settings' });
    }
};

export const updateAffiliateSettings = async (req: Request, res: Response) => {
    try {
        const { affiliate_commission_percentage } = req.body;

        await pool.query(
            `INSERT INTO settings (key, value, updated_at)
             VALUES ($1, $2, NOW())
             ON CONFLICT (key)
             DO UPDATE SET value = $2, updated_at = NOW()`,
            ['affiliate_commission_percentage', affiliate_commission_percentage]
        );

        res.json({
            message: 'Affiliate settings updated successfully',
            affiliate_commission_percentage
        });
    } catch (error) {
        console.error('Error updating affiliate settings:', error);
        res.status(500).json({ error: 'Failed to update affiliate settings' });
    }
};
