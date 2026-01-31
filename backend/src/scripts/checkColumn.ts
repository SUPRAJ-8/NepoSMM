import pool from '../config/db';

const checkSchema = async () => {
    try {
        const result = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'payment_methods' 
            AND column_name = 'charge_fee_percentage';
        `);
        if (result.rows.length > 0) {
            console.log('COLUMN EXISTS: charge_fee_percentage');
        } else {
            console.log('COLUMN MISSING: charge_fee_percentage');
        }
    } catch (error) {
        console.error('Error checking schema:', error);
    } finally {
        await pool.end();
    }
};

checkSchema();
