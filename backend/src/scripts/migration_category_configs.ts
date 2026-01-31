import { query } from '../config/db';
import logger from '../utils/logger';

async function runMigration() {
    try {
        logger.info('Starting category_configs migration...');

        // 1. Create category_configs table
        await query(`
            CREATE TABLE IF NOT EXISTS category_configs (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                sort_order INT DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Insert existing categories from services table
        await query(`
            INSERT INTO category_configs (name)
            SELECT DISTINCT category 
            FROM services 
            WHERE category IS NOT NULL
            ON CONFLICT (name) DO NOTHING
        `);

        logger.info('category_configs migration completed successfully.');
    } catch (err) {
        logger.error('Error in category_configs migration:', err);
    } finally {
        process.exit();
    }
}

runMigration();
