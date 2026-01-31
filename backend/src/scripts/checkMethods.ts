import pool from '../config/db';

const checkMethods = async () => {
    try {
        const result = await pool.query('SELECT id, name FROM payment_methods');
        console.log('Current payment methods in DB:');
        console.table(result.rows);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
};

checkMethods();
