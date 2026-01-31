import pool from '../config/db';

const checkSchema = async () => {
    try {
        const result = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'payment_methods';
        `);
        console.log('Schema:', result.rows);
    } catch (error) {
        console.error('Error checking schema:', error);
    } finally {
        await pool.end();
    }
};

checkSchema();
