import pool from '../config/db';

const listMethods = async () => {
    try {
        const result = await pool.query('SELECT id, name, type FROM payment_methods');
        console.log('Payment Methods:', result.rows);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
};

listMethods();
