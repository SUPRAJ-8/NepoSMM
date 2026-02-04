import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/db';
import logger from '../utils/logger';
import { AuthRequest } from '../middlewares/authMiddleware';
import { sendEmail } from '../utils/mailer';
import { getPasswordResetTemplate, getTwoFactorOTPTemplate, getSignUpEmailTemplate, getFundsAddedTemplate } from '../utils/emailTemplates';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const JWT_SECRET = process.env.JWT_SECRET || 'nepo-smm-secret-key-2025';

export const getUsers = async (req: Request, res: Response) => {
    try {
        const result = await query(`
            SELECT 
                u.id, 
                u.username, 
                u.email, 
                u.balance, 
                u.role, 
                u.status,
                u.whatsapp,
                u.created_at,
                COALESCE(SUM(CASE WHEN o.status != 'canceled' THEN o.charge ELSE 0 END), 0) as spent,
                COUNT(o.id) as orders
            FROM users u
            LEFT JOIN orders o ON u.id = o.user_id
            GROUP BY u.id
        `);
        res.json(result.rows);
    } catch (err) {
        logger.error('Error fetching users:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const registerUser = async (req: Request, res: Response) => {
    const { username, email, password, referralToken, whatsapp } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        let referred_by = null;
        if (referralToken) {
            // Find user id from referralToken (which is the referrer's username)
            const refUser = await query('SELECT id FROM users WHERE username = $1', [referralToken]);
            if (refUser.rows.length > 0) {
                referred_by = refUser.rows[0].id;
            }
        }

        const result = await query(
            'INSERT INTO users (username, email, password, role, referred_by, whatsapp) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, email, role, whatsapp, created_at',
            [username, email, hashedPassword, 'user', referred_by, whatsapp]
        );

        // Send Welcome Email
        try {
            await sendEmail(
                email,
                'Welcome to Nepo SMM! 🚀',
                `Hi ${username}, welcome to Nepo SMM. Your account has been created successfully.`,
                getSignUpEmailTemplate(username, email)
            );
        } catch (emailErr) {
            logger.error('Error sending welcome email:', emailErr);
            // Don't fail registration if email fails
        }

        const user = result.rows[0];
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                whatsapp: user.whatsapp,
                balance: 0,
                spent: 0,
                created_at: user.created_at
            }
        });
    } catch (err: any) {
        logger.error('Error registering user:', err);
        if (err.code === '23505') {
            if (err.detail.includes('username')) {
                return res.status(409).json({ error: 'Username already taken' });
            }
            return res.status(409).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body; // 'email' can be email or username
    try {
        const result = await query('SELECT * FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1)', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid identifier or password' });
        }

        const user = result.rows[0];

        if (user.status === 'banned') {
            return res.status(403).json({ error: 'Your account has been banned. Please contact support.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Calculate spent for login response
        const spentRes = await query(
            `SELECT COALESCE(SUM(CASE WHEN status != 'canceled' THEN charge ELSE 0 END), 0) as spent 
             FROM orders WHERE user_id = $1`,
            [user.id]
        );
        const spent = Number(spentRes.rows[0]?.spent || 0);

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        if (user.two_factor_enabled) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

            await query('UPDATE users SET otp_code = $1, otp_expiry = $2 WHERE id = $3', [otp, otpExpiry, user.id]);

            await sendEmail(
                user.email,
                'Login OTP - Nepo SMM',
                `Your login OTP is ${otp}. It expires in 10 minutes.`,
                getTwoFactorOTPTemplate(otp)
            );

            return res.json({ twoFactorRequired: true, userId: user.id });
        }

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                whatsapp: user.whatsapp,
                balance: user.balance,
                spent: spent,
                created_at: user.created_at
            }
        });
    } catch (err) {
        logger.error('Error logging in user:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const addFunds = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { amount, type, description } = req.body;

    try {
        await query('BEGIN');

        // Update user balance
        const userResult = await query(
            'UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING id, username, email, balance',
            [amount, id]
        );

        if (userResult.rows.length === 0) {
            await query('ROLLBACK');
            return res.status(404).json({ error: 'User not found' });
        }

        // Create transaction record
        await query(
            'INSERT INTO transactions (user_id, amount, type, description) VALUES ($1, $2, $3, $4)',
            [id, amount, type || 'manual', description || 'Funds added manually']
        );

        await query('COMMIT');

        res.json({
            message: 'Funds added successfully',
            user: userResult.rows[0]
        });
    } catch (err) {
        await query('ROLLBACK');
        logger.error('Error adding funds:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getUserTransactions = async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const result = await query(`
            SELECT 
                t.*,
                p.currency as payment_method_currency
            FROM transactions t
            LEFT JOIN payment_methods p ON t.payment_method_id = p.id
            WHERE t.user_id = $1 
            ORDER BY t.created_at DESC
        `, [userId]);
        res.json(result.rows);
    } catch (err) {
        logger.error('Error fetching transactions:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const createDepositRequest = async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;
    const { methodId, methodName, amount, fields } = req.body;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const result = await query(
            'INSERT INTO transactions (user_id, amount, type, description, status, payment_method_id, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [userId, amount, 'deposit', `Deposit via ${methodName}`, 'pending', methodId, JSON.stringify({ ...fields, methodName })]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        logger.error('Error creating deposit request:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getAllTransactions = async (req: Request, res: Response) => {
    try {
        const result = await query(`
            SELECT 
                t.*,
                u.username,
                u.email,
                p.name as payment_method_name,
                p.currency as payment_method_currency
            FROM transactions t
            LEFT JOIN users u ON t.user_id = u.id
            LEFT JOIN payment_methods p ON t.payment_method_id = p.id
            ORDER BY t.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        logger.error('Error fetching all transactions:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const approveTransaction = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await query('BEGIN');

        // Find the transaction
        const txResult = await query('SELECT * FROM transactions WHERE id = $1', [id]);
        if (txResult.rows.length === 0) {
            await query('ROLLBACK');
            return res.status(404).json({ error: 'Transaction not found' });
        }

        const tx = txResult.rows[0];
        if (tx.status !== 'pending') {
            await query('ROLLBACK');
            return res.status(400).json({ error: 'Only pending transactions can be approved' });
        }

        // Update transaction status
        await query('UPDATE transactions SET status = $1 WHERE id = $2', ['approved', id]);

        // If it's a deposit, update user balance and check for referrer
        if (tx.type === 'deposit') {
            const methodResult = await query('SELECT * FROM payment_methods WHERE id = $1', [tx.payment_method_id]);
            const method = methodResult.rows[0];

            const originalAmount = Number(tx.amount);
            let finalAmount = originalAmount;
            let bonusAmount = 0;
            let chargeAmount = 0;

            if (method) {
                // 1. Calculate Charge if applicable
                if (method.charge_fee_percentage > 0) {
                    chargeAmount = originalAmount * (method.charge_fee_percentage / 100);
                }

                // 2. Calculate Bonus on Original Amount (Charge does not affect bonus basis)
                if (method.bonus_percentage > 0) {
                    bonusAmount = originalAmount * (method.bonus_percentage / 100);
                }
            }

            finalAmount = originalAmount + bonusAmount - chargeAmount;

            // 1. Update original transaction to just show the base amount
            await query('UPDATE transactions SET amount = $1 WHERE id = $2', [originalAmount, id]);

            // 2. Create Bonus Transaction if applicable
            if (bonusAmount > 0) {
                await query(
                    'INSERT INTO transactions (user_id, amount, type, description, status, payment_method_id, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                    [tx.user_id, bonusAmount, 'bonus', 'Bonus gain', 'approved', tx.payment_method_id, JSON.stringify({ parent_tx_id: id })]
                );
            }

            // 3. Create Charge Transaction if applicable
            if (chargeAmount > 0) {
                await query(
                    'INSERT INTO transactions (user_id, amount, type, description, status, payment_method_id, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                    [tx.user_id, chargeAmount, 'fee', 'Charge applied', 'approved', tx.payment_method_id, JSON.stringify({ parent_tx_id: id })]
                );
            }

            // 4. Update user balance with final calculated amount
            await query('UPDATE users SET balance = balance + $1 WHERE id = $2', [finalAmount, tx.user_id]);

            // Affiliate Commission logic
            const userRes = await query('SELECT referred_by FROM users WHERE id = $1', [tx.user_id]);
            const referrerId = userRes.rows[0]?.referred_by;

            if (referrerId) {
                // Get commission percentage from settings
                const commissionSettingRes = await query(
                    'SELECT value FROM settings WHERE key = $1',
                    ['affiliate_commission_percentage']
                );

                const commissionPercentage = Number(commissionSettingRes.rows[0]?.value || 2); // Default to 2%
                const commission = Number(tx.amount) * (commissionPercentage / 100);

                if (commission > 0) {
                    await query('UPDATE users SET affiliate_balance = affiliate_balance + $1 WHERE id = $2', [commission, referrerId]);
                    await query(
                        'INSERT INTO affiliate_logs (referrer_id, referred_user_id, deposit_amount, commission_earned) VALUES ($1, $2, $3, $4)',
                        [referrerId, tx.user_id, tx.amount, commission]
                    );
                }
            }
        }

        await query('COMMIT');

        // Send Funds Added Email
        try {
            const userFullRes = await query('SELECT username, email, balance FROM users WHERE id = $1', [tx.user_id]);
            if (userFullRes.rows.length > 0) {
                const user = userFullRes.rows[0];
                await sendEmail(
                    user.email,
                    'Funds Added Successfully! 💰',
                    `Hi ${user.username}, your deposit of $${tx.amount} has been approved. Your new balance is $${user.balance}.`,
                    getFundsAddedTemplate(user.username, `$${tx.amount}`, `$${user.balance}`)
                );
            }
        } catch (emailErr) {
            logger.error('Error sending funds added email:', emailErr);
        }

        res.json({ message: 'Transaction approved successfully' });
    } catch (err) {
        await query('ROLLBACK');
        logger.error('Error approving transaction:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const rejectTransaction = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { reason } = req.body;
    try {
        const result = await query(
            'UPDATE transactions SET status = $1, description = $2 WHERE id = $3 AND status = $4 RETURNING *',
            ['rejected', reason || 'Rejected by admin', id, 'pending']
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Transaction not found or not pending' });
        }

        res.json({ message: 'Transaction rejected successfully' });
    } catch (err) {
        logger.error('Error rejecting transaction:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const deleteTransaction = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await query('DELETE FROM transactions WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.json({ message: 'Transaction deleted successfully' });
    } catch (err) {
        logger.error('Error deleting transaction:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await query('BEGIN');

        // 1. Handle referrals (Set referred_by to NULL for users referred by this user)
        await query('UPDATE users SET referred_by = NULL WHERE referred_by = $1', [id]);

        // 2. Delete affiliate logs
        await query('DELETE FROM affiliate_logs WHERE referrer_id = $1 OR referred_user_id = $1', [id]);

        // 3. Delete payout requests
        await query('DELETE FROM payout_requests WHERE user_id = $1', [id]);

        // 4. Delete tickets
        await query('DELETE FROM tickets WHERE user_id = $1', [id]);

        // 5. Delete transactions
        await query('DELETE FROM transactions WHERE user_id = $1', [id]);

        // 6. Delete orders
        await query('DELETE FROM orders WHERE user_id = $1', [id]);

        // 7. Finally delete the user
        const result = await query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            await query('ROLLBACK');
            return res.status(404).json({ error: 'User not found' });
        }

        await query('COMMIT');
        res.json({ message: 'User and all associated data deleted successfully' });
    } catch (err) {
        await query('ROLLBACK');
        logger.error('Error deleting user:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const toggleUserStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body; // 'active' or 'banned'

    try {
        const result = await query(
            'UPDATE users SET status = $1 WHERE id = $2 RETURNING id, username, status',
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: `User status updated to ${status}`, user: result.rows[0] });
    } catch (err) {
        logger.error('Error toggling user status:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getProfile = async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const result = await query(`
            SELECT 
                u.id, 
                u.username, 
                u.email, 
                u.balance, 
                u.role, 
                u.whatsapp,
                u.created_at,
                u.two_factor_enabled,
                COALESCE(SUM(CASE WHEN o.status != 'canceled' THEN o.charge ELSE 0 END), 0) as spent
            FROM users u
            LEFT JOIN orders o ON u.id = o.user_id
            WHERE u.id = $1
            GROUP BY u.id
        `, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        logger.error('Error fetching profile:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    const { identifier } = req.body; // email or username
    try {
        const result = await query('SELECT id, email, username FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1)', [identifier]);

        if (result.rows.length === 0) {
            // We return success even if user not found to prevent user enumeration
            return res.json({ message: 'If an account exists with that identifier, a reset link has been sent.' });
        }

        const user = result.rows[0];
        const token = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 3600000); // 1 hour from now

        await query(
            'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
            [token, expiry, user.id]
        );

        const resetLink = `${process.env.FRONTEND_URL || 'https://neposmm.com'}/reset-password?token=${token}`;
        const html = getPasswordResetTemplate(resetLink);

        await sendEmail(user.email, 'Reset Your Password - Nepo SMM', '', html);

        res.json({ message: 'If an account exists with that identifier, a reset link has been sent.' });
    } catch (err) {
        logger.error('Error in forgotPassword:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    const { token, password } = req.body;
    try {
        const result = await query(
            'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        const user = result.rows[0];
        const hashedPassword = await bcrypt.hash(password, 10);

        await query(
            'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
            [hashedPassword, user.id]
        );

        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        logger.error('Error in resetPassword:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
export const refundTransaction = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { reason } = req.body;

    try {
        await query('BEGIN');

        // 1. Find the transaction
        const txResult = await query('SELECT * FROM transactions WHERE id = $1', [id]);
        if (txResult.rows.length === 0) {
            await query('ROLLBACK');
            return res.status(404).json({ error: 'Transaction not found' });
        }
        const tx = txResult.rows[0];

        // 2. Only approved transactions can be refunded in this manner (pending can be rejected)
        if (tx.status !== 'approved') {
            await query('ROLLBACK');
            return res.status(400).json({ error: 'Only approved transactions can be refunded' });
        }

        // 3. Find related transactions (bonus, fee) linked to this parent
        // Note: We check metadata->>'parent_tx_id' for string equality with the id
        const relatedRes = await query(
            `SELECT * FROM transactions WHERE metadata->>'parent_tx_id' = $1`,
            [String(id)]
        );
        const relatedTxs = relatedRes.rows;

        // 4. Calculate Net Amount to reverse
        // Logic:
        // Deposit/Bonus/Manual: These ADDED to balance, so we must SUBTRACT.
        // Fee: This REDUCED balance, so we must ADD back.
        let netReversalAmount = 0;

        // Parent
        if (['deposit', 'manual', 'bonus'].includes(tx.type)) {
            netReversalAmount += Number(tx.amount);
        } else if (tx.type === 'fee') {
            // Refunding a standalone fee? Unusual but implies giving money back.
            // If fee was negative on balance, refunding it means +balance.
            // But usually we refund the PARENT which reverses all children.
            // If this is a fee, we treat it as reversing a charge -> +Amount
            netReversalAmount -= Number(tx.amount);
        }

        // Children
        for (const child of relatedTxs) {
            if (child.status === 'approved') {
                if (['deposit', 'manual', 'bonus'].includes(child.type)) {
                    netReversalAmount += Number(child.amount);
                } else if (child.type === 'fee') {
                    netReversalAmount -= Number(child.amount);
                }
            }
        }

        // 5. Update User Balance (Subtract the Net Reversal Amount)
        // If netReversalAmount is positive (e.g. they got money), we subtract it.
        // If they lost money (unlikely for a refunded deposit), we add it.
        await query('UPDATE users SET balance = balance - $1 WHERE id = $2', [netReversalAmount, tx.user_id]);

        // 6. Mark Parent as Refunded
        await query(
            'UPDATE transactions SET status = $1, description = $2 WHERE id = $3',
            ['refunded', reason ? `Refunded: ${reason}` : 'Refunded', id]
        );

        // 7. Mark Children as Refunded
        for (const child of relatedTxs) {
            await query(
                'UPDATE transactions SET status = $1, description = $2 WHERE id = $3',
                ['refunded', `Refunded (Parent TX-${id})`, child.id]
            );
        }

        await query('COMMIT');

        logger.info(`Transaction ${id} refunded by admin. Net reversal: ${netReversalAmount}`);
        res.json({ message: 'Transaction refunded and balance updated' });

    } catch (err) {
        await query('ROLLBACK');
        logger.error('Error refunding transaction:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;
    const { email, whatsapp } = req.body;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Check if email already exists
        if (email) {
            const emailCheck = await query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, userId]);
            if (emailCheck.rows.length > 0) {
                return res.status(409).json({ error: 'Email already in use' });
            }
        }

        const result = await query(
            'UPDATE users SET email = COALESCE($1, email), whatsapp = COALESCE($2, whatsapp) WHERE id = $3 RETURNING id, username, email, whatsapp, balance, role, created_at',
            [email, whatsapp, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'Profile updated successfully', user: result.rows[0] });
    } catch (err) {
        logger.error('Error updating profile:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const changePassword = async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const userRes = await query('SELECT password FROM users WHERE id = $1', [userId]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, userRes.rows[0].password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Incorrect current password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);

        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        logger.error('Error changing password:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const toggle2FA = async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;
    const { enabled } = req.body;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        await query('UPDATE users SET two_factor_enabled = $1 WHERE id = $2', [enabled, userId]);
        res.json({ message: `2FA ${enabled ? 'enabled' : 'disabled'} successfully`, two_factor_enabled: enabled });
    } catch (err) {
        logger.error('Error toggling 2FA:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


export const verify2FA = async (req: Request, res: Response) => {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
        return res.status(400).json({ error: 'Missing userId or OTP' });
    }

    try {
        const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];

        if (user.status === 'banned') {
            return res.status(403).json({ error: 'Your account has been banned. Please contact support.' });
        }

        if (!user.otp_code || !user.otp_expiry || new Date() > new Date(user.otp_expiry)) {
            return res.status(401).json({ error: 'OTP expired or not requested' });
        }

        if (user.otp_code !== otp) {
            return res.status(401).json({ error: 'Invalid OTP' });
        }

        // Clear OTP
        await query('UPDATE users SET otp_code = NULL, otp_expiry = NULL WHERE id = $1', [user.id]);

        // Same as login logic
        const spentRes = await query(
            `SELECT COALESCE(SUM(CASE WHEN status != 'canceled' THEN charge ELSE 0 END), 0) as spent 
             FROM orders WHERE user_id = $1`,
            [user.id]
        );
        const spent = Number(spentRes.rows[0]?.spent || 0);

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                whatsapp: user.whatsapp,
                balance: user.balance,
                spent: spent,
                created_at: user.created_at
            }
        });
    } catch (err) {
        logger.error('Error verifying 2FA:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
export const googleLogin = async (req: Request, res: Response) => {
    const { credential } = req.body;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            return res.status(400).json({ error: 'Invalid Google token' });
        }

        const { email, name, sub: googleId } = payload;

        // Check if user exists
        let userResult = await query('SELECT * FROM users WHERE email = $1', [email]);
        let user;

        if (userResult.rows.length === 0) {
            // Create user if not exists
            const username = (name || email?.split('@')[0] || 'user').toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000);
            const hashedPassword = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10); // Random password for social login

            const newUser = await query(
                'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at',
                [username, email, hashedPassword, 'user']
            );
            user = newUser.rows[0];

            // Send Welcome Email
            try {
                if (email) {
                    await sendEmail(
                        email,
                        'Welcome to Nepo SMM! 🚀',
                        `Hi ${username}, welcome to Nepo SMM via Google. Your account has been created successfully.`,
                        getSignUpEmailTemplate(username, email)
                    );
                }
            } catch (emailErr) {
                logger.error('Error sending welcome email (Google):', emailErr);
            }
        } else {
            user = userResult.rows[0];
        }

        if (user.status === 'banned') {
            return res.status(403).json({ error: 'Your account has been banned. Please contact support.' });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Fetch spent
        const spentRes = await query(
            `SELECT COALESCE(SUM(CASE WHEN status != 'canceled' THEN charge ELSE 0 END), 0) as spent 
             FROM orders WHERE user_id = $1`,
            [user.id]
        );
        const spent = Number(spentRes.rows[0]?.spent || 0);

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                whatsapp: user.whatsapp,
                balance: user.balance || 0,
                spent: spent,
                created_at: user.created_at
            }
        });
    } catch (err) {
        logger.error('Error in googleLogin:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
