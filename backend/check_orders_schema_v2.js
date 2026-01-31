const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function check() {
    try {
        const res = await pool.query("SELECT column_name, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'orders'");
        console.log('--- ORDERS TABLE SCHEMA ---');
        res.rows.forEach(r => {
            console.log(`${r.column_name}: Nullable=${r.is_nullable}, Default=${r.column_default}`);
        });
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

check();
