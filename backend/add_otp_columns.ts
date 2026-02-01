import { query } from './src/config/db';

async function addOtpColumns() {
    try {
        console.log('Adding OTP columns to users table...');
        await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_code VARCHAR(10)');
        await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expiry TIMESTAMP');
        console.log('Columns added successfully or already exist.');
    } catch (err) {
        console.error('Error adding columns:', err);
    } finally {
        process.exit();
    }
}

addOtpColumns();
