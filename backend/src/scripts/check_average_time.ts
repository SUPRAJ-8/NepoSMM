import pool from '../config/db';

async function checkAverageTime() {
    try {
        const res = await pool.query(`SELECT id, name, average_time FROM services WHERE status = 'active' LIMIT 10`);
        console.log('Services Average Time:', res.rows);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

checkAverageTime();
