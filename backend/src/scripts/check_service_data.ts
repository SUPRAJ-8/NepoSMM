import pool from '../config/db';

async function checkData() {
    try {
        const res = await pool.query(`SELECT * FROM services LIMIT 1`);
        console.log('Service Row Keys:', Object.keys(res.rows[0]));
        console.log('Service Row:', res.rows[0]);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

checkData();
