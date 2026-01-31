import { query } from '../config/db';
import logger from '../utils/logger';

const addDisplayNameFields = async () => {
    try {
        logger.info('Adding display name fields to services table...');

        // Add original_name (raw from API, never shown)
        await query(`
            ALTER TABLE services 
            ADD COLUMN IF NOT EXISTS original_name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS display_name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS original_category VARCHAR(255),
            ADD COLUMN IF NOT EXISTS display_category VARCHAR(255)
        `);

        // Migrate existing data: copy current name to both original and display
        await query(`
            UPDATE services 
            SET original_name = name,
                display_name = name,
                original_category = category,
                display_category = category
            WHERE original_name IS NULL
        `);

        logger.info('Successfully added display name fields to services table');
        process.exit(0);
    } catch (error) {
        logger.error('Failed to add display name fields:', error);
        process.exit(1);
    }
};

addDisplayNameFields();
