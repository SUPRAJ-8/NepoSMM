import { query } from '../config/db';
import logger from '../utils/logger';

const setupCurrencyTable = async () => {
    try {
        logger.info('Setting up currency table...');

        // Create currencies table
        await query(`
            CREATE TABLE IF NOT EXISTS currencies (
                code VARCHAR(3) PRIMARY KEY,
                rate DECIMAL(10, 2) NOT NULL, -- Rate relative to NPR (how much 1 Unit is in NPR)
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                auto_update BOOLEAN DEFAULT TRUE
            )
        `);

        // Insert default rates
        const defaultRates = [
            ['INR', 1.6],
            ['USD', 135.0],
            ['EUR', 145.0],
            ['GBP', 170.0],
            ['NPR', 1.0]
        ];

        for (const [code, rate] of defaultRates) {
            await query(`
                INSERT INTO currencies (code, rate) 
                VALUES ($1, $2) 
                ON CONFLICT (code) DO NOTHING
            `, [code, rate]);
        }

        logger.info('Currency table setup complete');
        process.exit(0);
    } catch (error) {
        logger.error('Failed to setup currency table:', error);
        process.exit(1);
    }
};

setupCurrencyTable();
