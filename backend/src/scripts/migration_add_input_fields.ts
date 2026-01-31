import pool, { query } from '../config/db';

async function runMigration() {
    try {
        console.log('Starting migration to add input_fields...');

        await query(`
            ALTER TABLE payment_methods 
            ADD COLUMN IF NOT EXISTS input_fields TEXT;
        `);
        console.log('Added input_fields column.');

        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

runMigration();
