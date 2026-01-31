import pool, { query } from '../config/db';

async function runMigration() {
    try {
        console.log('Starting migration to update transactions table...');

        // Add status column
        await query(`
            ALTER TABLE transactions 
            ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'approved';
        `);
        console.log('Added status column.');

        // Add metadata column for dynamic fields
        await query(`
            ALTER TABLE transactions 
            ADD COLUMN IF NOT EXISTS metadata JSONB;
        `);
        console.log('Added metadata column.');

        // Add payment_method_id column
        await query(`
            ALTER TABLE transactions 
            ADD COLUMN IF NOT EXISTS payment_method_id INTEGER REFERENCES payment_methods(id);
        `);
        console.log('Added payment_method_id column.');

        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

runMigration();
