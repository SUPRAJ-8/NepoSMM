import { Request, Response } from 'express';
import { query } from '../config/db';
import logger from '../utils/logger';

export const getPaymentMethods = async (req: Request, res: Response) => {
    try {
        // Only return active ones for users, but admins might want all.
        // For now, let's allow filtering via query param ?all=true
        const { all } = req.query;
        let sql = 'SELECT * FROM payment_methods';
        if (all !== 'true') {
            sql += ' WHERE is_active = true';
        }
        sql += ' ORDER BY sort_order ASC';

        const result = await query(sql);
        res.json(result.rows);
    } catch (err) {
        logger.error('Error fetching payment methods:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getPaymentMethodById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await query('SELECT * FROM payment_methods WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Payment method not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        logger.error('Error fetching payment method:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const createPaymentMethod = async (req: Request, res: Response) => {
    const { name, description, type, bonus_percentage, charge_fee_percentage, instructions, qr_code_url, input_fields, is_active, currency } = req.body;
    try {
        logger.info('Creating payment method:', { name, type, bonus_percentage, charge_fee_percentage });
        const result = await query(
            `INSERT INTO payment_methods (name, description, type, bonus_percentage, charge_fee_percentage, instructions, qr_code_url, input_fields, is_active, currency) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [name, description, type, bonus_percentage || 0, charge_fee_percentage || 0, instructions, qr_code_url, input_fields, is_active !== undefined ? is_active : true, currency || 'USD']
        );
        logger.info('Payment method created successfully:', result.rows[0].id);
        res.status(201).json(result.rows[0]);
    } catch (err: any) {
        logger.error('Error creating payment method:', {
            message: err.message,
            code: err.code,
            detail: err.detail,
            stack: err.stack
        });
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
};

export const updatePaymentMethod = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, type, bonus_percentage, charge_fee_percentage, instructions, qr_code_url, input_fields, is_active, currency } = req.body;

    try {
        logger.info(`Updating payment method ${id}:`, { name, type, bonus_percentage, charge_fee_percentage });
        const result = await query(
            `UPDATE payment_methods 
             SET name = $1, description = $2, type = $3, bonus_percentage = $4, charge_fee_percentage = $5, instructions = $6, qr_code_url = $7, input_fields = $8, is_active = $9, currency = $10
             WHERE id = $11 RETURNING *`,
            [name, description, type, bonus_percentage || 0, charge_fee_percentage || 0, instructions, qr_code_url, input_fields, is_active, currency || 'USD', id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Payment method not found' });
        }
        logger.info('Payment method updated successfully:', result.rows[0].id);
        res.json(result.rows[0]);
    } catch (err: any) {
        logger.error('Error updating payment method:', {
            message: err.message,
            code: err.code,
            stack: err.stack
        });
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
};

export const deletePaymentMethod = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await query('DELETE FROM payment_methods WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Payment method not found' });
        }
        res.json({ message: 'Payment method deleted successfully' });
    } catch (err) {
        logger.error('Error deleting payment method:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
export const reorderPaymentMethods = async (req: Request, res: Response) => {
    const { orders } = req.body; // Array of { id, sort_order }
    try {
        for (const item of orders) {
            await query('UPDATE payment_methods SET sort_order = $1 WHERE id = $2', [item.sort_order, item.id]);
        }
        res.json({ message: 'Reordered successfully' });
    } catch (err: any) {
        logger.error('Error reordering payment methods:', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
};
