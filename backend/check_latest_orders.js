const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function check() {
    try {
        const res = await pool.query("SELECT id, user_id, status, created_at FROM orders ORDER BY created_at DESC LIMIT 5");
        console.log('--- LATEST ORDERS ---');
        res.rows.forEach(r => {
            console.log(`ID: ${r.id}, User: ${r.user_id}, Status: ${r.status}, Date: ${r.created_at}`);
        });
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

check();
