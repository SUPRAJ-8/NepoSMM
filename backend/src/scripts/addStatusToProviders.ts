
import { query } from '../config/db';

const migrate = async () => {
    try {
        console.log('Adding status column to providers table...');
        await query("ALTER TABLE providers ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'");
        console.log('Successfully added status column.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
