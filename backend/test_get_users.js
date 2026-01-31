const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function check() {
    try {
        console.log('Running getUsers query...');
        const result = await pool.query(`
            SELECT 
                u.id, 
                u.username, 
                u.email, 
                u.balance, 
                u.role, 
                u.created_at,
                COALESCE(SUM(CASE WHEN o.status != 'canceled' THEN o.charge ELSE 0 END), 0) as spent,
                COUNT(o.id) as orders
            FROM users u
            LEFT JOIN orders o ON u.id = o.user_id
            GROUP BY u.id
        `);
        console.log('Query successful, row count:', result.rows.length);
        console.log('First row:', result.rows[0]);
    } catch (err) {
        console.error('Query failed:', err.message);
    } finally {
        await pool.end();
    }
}

check();
