import { query } from '../config/db';
import logger from '../utils/logger';

const addVerifiedColumn = async () => {
    try {
        logger.info('Adding verified column to services table...');

        // Add verified column
        await query(`
            ALTER TABLE services 
            ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE
        `);

        // Create index
        await query(`
            CREATE INDEX IF NOT EXISTS idx_services_verified ON services(verified)
        `);

        // Mark all existing active services as verified (for backward compatibility)
        await query(`
            UPDATE services SET verified = TRUE WHERE status = 'active'
        `);

        logger.info('Successfully added verified column to services table');
        process.exit(0);
    } catch (error) {
        logger.error('Failed to add verified column:', error);
        process.exit(1);
    }
};

addVerifiedColumn();
