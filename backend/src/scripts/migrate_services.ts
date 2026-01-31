import { query } from '../config/db';

async function migrate() {
    console.log('Starting migration: adding detailed fields to services table...');
    try {
        await query(`
            ALTER TABLE services 
            ADD COLUMN IF NOT EXISTS description TEXT,
            ADD COLUMN IF NOT EXISTS average_time VARCHAR(100),
            ADD COLUMN IF NOT EXISTS guarantee VARCHAR(100),
            ADD COLUMN IF NOT EXISTS start_time VARCHAR(100),
            ADD COLUMN IF NOT EXISTS speed VARCHAR(100);
        `);
        console.log('Migration successful: columns added to services table.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit();
    }
}

migrate();
