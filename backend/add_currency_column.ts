import { query } from './src/config/db';
import logger from './src/utils/logger';

async function addCurrencyColumn() {
    try {
        console.log('Adding currency column to payment_methods table...');
        await query('ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT \'USD\'');
        console.log('Column added successfully or already exists.');
    } catch (err) {
        console.error('Error adding column:', err);
    } finally {
        process.exit();
    }
}

addCurrencyColumn();
