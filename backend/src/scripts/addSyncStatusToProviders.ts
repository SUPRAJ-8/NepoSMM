import { query } from '../config/db';

const migrate = async () => {
    try {
        console.log('Adding sync_status and sync_error to providers table...');

        // Add sync_status column if it doesn't exist
        await query(`
            ALTER TABLE providers 
            ADD COLUMN IF NOT EXISTS sync_status VARCHAR(50) DEFAULT 'idle',
            ADD COLUMN IF NOT EXISTS sync_error TEXT
        `);

        console.log('Migration successful!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
