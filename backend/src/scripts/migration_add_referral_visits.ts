import pool from '../config/db';

async function runMigration() {
    try {
        console.log('Adding referral_visits column to users table...');

        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS referral_visits INTEGER DEFAULT 0;
        `);

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await pool.end();
    }
}

runMigration();
