import pool from '../config/db';

const migrateOrders = async () => {
    try {
        await pool.query(`
            ALTER TABLE orders 
            ADD COLUMN IF NOT EXISTS external_order_id VARCHAR(100)
        `);
        console.log('Migration successful: orders table updated.');
    } catch (err: any) {
        console.error('Migration failed:', err.message);
    } finally {
        await pool.end();
    }
};

migrateOrders();
