import pool from '../config/db';

const migrate = async () => {
    try {
        console.log('Starting Affiliate migration...');

        // 1. Add referred_by and affiliate_balance to users
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS referred_by INTEGER REFERENCES users(id),
            ADD COLUMN IF NOT EXISTS affiliate_balance NUMERIC(15, 2) DEFAULT 0;
        `);
        console.log('Updated users table with referred_by and affiliate_balance.');

        // 2. Create payout_requests table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS payout_requests (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                amount NUMERIC(15, 2) NOT NULL,
                status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, completed
                payment_method_info TEXT, -- WhatsApp or other info
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Created payout_requests table.');

        // 3. Create affiliate_logs table (Optional but good for history)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS affiliate_logs (
                id SERIAL PRIMARY KEY,
                referrer_id INTEGER NOT NULL REFERENCES users(id),
                referred_user_id INTEGER NOT NULL REFERENCES users(id),
                deposit_amount NUMERIC(15, 2) NOT NULL,
                commission_earned NUMERIC(15, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Created affiliate_logs table.');

        console.log('Affiliate migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await pool.end();
    }
};

migrate();
