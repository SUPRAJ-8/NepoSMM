import { query } from '../config/db';

async function migrate() {
    console.log('Starting migration...');
    try {
        await query("ALTER TABLE providers ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR';");
        console.log('Migration successful: Added currency column to providers table.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit();
    }
}

migrate();
