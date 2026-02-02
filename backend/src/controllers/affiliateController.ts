import { Request, Response } from 'express';
import pool from '../config/db';

export const getAffiliateStats = async (req: Request, res: Response) => {
    try {
        const stats = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM users WHERE referred_by IS NOT NULL) as total_referrals,
                (SELECT COALESCE(SUM(amount), 0) FROM payout_requests WHERE status = 'pending') as total_pending_payouts,
                (SELECT COUNT(*) FROM payout_requests WHERE status = 'pending') as pending_requests_count,
                (SELECT COALESCE(SUM(amount), 0) FROM payout_requests WHERE status = 'completed') as total_paid,
                (SELECT COUNT(DISTINCT id) FROM users WHERE id IN (SELECT referred_by FROM users WHERE referred_by IS NOT NULL)) as active_partners,
                (SELECT SUM(referral_visits) FROM users) as total_visits
        `);

        res.json(stats.rows[0]);
    } catch (error) {
        console.error('getAffiliateStats error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAllPayoutRequests = async (req: Request, res: Response) => {
    try {
        const requests = await pool.query(`
            SELECT pr.*, u.username, u.email, u.affiliate_balance
            FROM payout_requests pr
            JOIN users u ON pr.user_id = u.id
            ORDER BY pr.created_at DESC
        `);

        res.json(requests.rows);
    } catch (error) {
        console.error('getAllPayoutRequests error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updatePayoutStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, reason } = req.body; // approved, rejected, completed

    try {
        await pool.query('BEGIN');

        const prResult = await pool.query('SELECT * FROM payout_requests WHERE id = $1', [id]);
        if (prResult.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'Payout request not found' });
        }

        const currentRequest = prResult.rows[0];
        const oldStatus = currentRequest.status;

        // Update status
        await pool.query(
            'UPDATE payout_requests SET status = $1, rejection_reason = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
            [status, reason || null, id]
        );

        // If status changed TO rejected FROM something else, refund balance (adding back to affiliate_balance)
        if (status === 'rejected' && oldStatus !== 'rejected') {
            await pool.query(
                'UPDATE users SET affiliate_balance = affiliate_balance + $1 WHERE id = $2',
                [currentRequest.amount, currentRequest.user_id]
            );
        }

        // If status changed TO approved FROM something else, NO refund needed (money stays deducted).
        // If status changed TO completed FROM something else, NO refund needed.

        // If status was rejected and changed BACK to pending/approved/completed, re-deduct
        if (oldStatus === 'rejected' && status !== 'rejected') {
            await pool.query(
                'UPDATE users SET affiliate_balance = affiliate_balance - $1 WHERE id = $2',
                [currentRequest.amount, currentRequest.user_id]
            );
        }

        await pool.query('COMMIT');
        res.json({ message: `Payout request ${status}` });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('updatePayoutStatus error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getReferralLogs = async (req: Request, res: Response) => {
    try {
        const logs = await pool.query(`
            SELECT al.*, r.username as referrer_name, ru.username as referred_name
            FROM affiliate_logs al
            JOIN users r ON al.referrer_id = r.id
            JOIN users ru ON al.referred_user_id = ru.id
            ORDER BY al.created_at DESC
            LIMIT 100
        `);

        res.json(logs.rows);
    } catch (error) {
        console.error('getReferralLogs error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createPayoutRequest = async (req: Request, res: Response) => {
    const { userId, amount, paymentInfo } = req.body;

    try {
        await pool.query('BEGIN');

        // Check balance
        const userRes = await pool.query('SELECT affiliate_balance FROM users WHERE id = $1', [userId]);
        if (userRes.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'User not found' });
        }

        const balance = Number(userRes.rows[0].affiliate_balance);
        if (balance < amount) {
            await pool.query('ROLLBACK');
            return res.status(400).json({ message: 'Insufficient affiliate balance' });
        }

        // Deduct balance
        await pool.query('UPDATE users SET affiliate_balance = affiliate_balance - $1 WHERE id = $2', [amount, userId]);

        // Create request
        await pool.query(
            'INSERT INTO payout_requests (user_id, amount, payment_method_info) VALUES ($1, $2, $3)',
            [userId, amount, paymentInfo]
        );

        await pool.query('COMMIT');
        res.status(201).json({ message: 'Payout request submitted successfully' });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('createPayoutRequest error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getUserAffiliateStats = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const result = await pool.query(`
            SELECT 
                affiliate_balance as unpaid_earnings,
                referral_visits as total_visits,
                (SELECT COUNT(*) FROM users WHERE referred_by = $1) as total_referrals,
                (SELECT COALESCE(SUM(commission_earned), 0) FROM affiliate_logs WHERE referrer_id = $1) as total_earnings,
                (SELECT COUNT(*) FROM affiliate_logs WHERE referrer_id = $1) as conversions,
                (SELECT COUNT(*) FROM payout_requests WHERE user_id = $1 AND status = 'completed') as paid_referrals
            FROM users 
            WHERE id = $1
        `, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('getUserAffiliateStats error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const recordVisit = async (req: Request, res: Response) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ message: 'Referral code is required' });
    }

    try {
        // Try to increment by username first, then ID if it looks like a UUID or ID
        // Assuming code is username for now based on URL format

        let result = await pool.query(
            'UPDATE users SET referral_visits = referral_visits + 1 WHERE username = $1 RETURNING id',
            [code]
        );

        if (result.rowCount === 0) {
            // If code is numeric or uuid, try finding by ID
            if (!isNaN(Number(code))) {
                result = await pool.query(
                    'UPDATE users SET referral_visits = referral_visits + 1 WHERE id = $1 RETURNING id',
                    [code]
                );
            }
        }

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Referrer not found' });
        }

        res.json({ message: 'Visit recorded' });
    } catch (error) {
        console.error('recordVisit error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
