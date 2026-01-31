const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function check() {
    try {
        const res = await pool.query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 5");
        console.log('Last 5 orders:');
        console.table(res.rows);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

check();
