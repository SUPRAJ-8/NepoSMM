const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function check() {
    try {
        const res = await pool.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders')");
        console.log('Orders table exists:', res.rows[0].exists);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

check();
