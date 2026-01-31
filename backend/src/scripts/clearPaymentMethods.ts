import pool from '../config/db';

const removeMockData = async () => {
    try {
        await pool.query('DELETE FROM payment_methods');
        console.log('Successfully removed all payment methods.');
    } catch (error) {
        console.error('Error removing payment methods:', error);
    } finally {
        await pool.end();
    }
};

removeMockData();
