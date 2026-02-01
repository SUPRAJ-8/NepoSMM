
import pool from '../config/db';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../../.env') });

const checkSettings = async () => {
    try {
        const result = await pool.query('SELECT key, value FROM settings');
        console.log('--- DB SETTINGS ---');
        result.rows.forEach(row => {
            console.log(`${row.key}: ${row.value}`);
        });
        console.log('-------------------');
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
};

checkSettings();
