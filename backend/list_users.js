const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function check() {
    try {
        const result = await pool.query('SELECT username, email, role FROM users ORDER BY created_at DESC');
        console.log('Total users:', result.rows.length);
        result.rows.forEach(u => {
            console.log(`- ${u.username} | ${u.email} | ${u.role}`);
        });

        const nonAdmins = result.rows.filter(u => u.role !== 'admin');
        console.log('\nNon-admin users (shown in dashboard):', nonAdmins.length);
        nonAdmins.forEach(u => {
            console.log(`- ${u.username} | ${u.email}`);
        });
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

check();
