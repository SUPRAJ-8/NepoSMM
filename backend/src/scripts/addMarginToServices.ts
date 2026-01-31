import { query } from '../config/db';

const migrate = async () => {
    try {
        console.log('Adding margin column to services table...');

        await query(`
            ALTER TABLE services 
            ADD COLUMN IF NOT EXISTS margin DECIMAL(10, 2) DEFAULT 45.00
        `);

        console.log('Migration successful!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
