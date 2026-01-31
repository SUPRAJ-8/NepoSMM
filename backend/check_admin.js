const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function check() {
    try {
        const result = await pool.query("SELECT * FROM users WHERE username = 'neposmm-8'");
        console.log('Admin user found:', result.rows.length > 0);
        if (result.rows.length > 0) {
            console.log('Role:', result.rows[0].role);
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

check();
