import pool from '../config/db';

const migrateServices = async () => {
    try {
        // Add provider_id if missing
        await pool.query(`
            ALTER TABLE services 
            ADD COLUMN IF NOT EXISTS provider_id INT,
            ADD COLUMN IF NOT EXISTS external_service_id VARCHAR(50),
            ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active'
        `);
        // Change rate precision
        await pool.query(`
            ALTER TABLE services 
            ALTER COLUMN rate TYPE DECIMAL(10, 5)
        `);
        console.log('Migration successful: services table updated.');
    } catch (err: any) {
        console.error('Migration failed:', err.message);
    } finally {
        await pool.end();
    }
};

migrateServices();
