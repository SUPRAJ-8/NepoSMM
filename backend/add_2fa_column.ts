import { query } from './src/config/db';

async function addTwoFactorColumn() {
    try {
        console.log('Adding two_factor_enabled column to users table...');
        await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE');
        console.log('Column added successfully or already exists.');
    } catch (err) {
        console.error('Error adding column:', err);
    } finally {
        process.exit();
    }
}

addTwoFactorColumn();
