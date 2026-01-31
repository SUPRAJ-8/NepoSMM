const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function verify() {
    try {
        console.log('=== CHECKING ALL USERS IN DATABASE ===\n');

        const allUsers = await pool.query('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC');
        console.log(`Total users in database: ${allUsers.rows.length}\n`);

        allUsers.rows.forEach((user, index) => {
            console.log(`${index + 1}. ${user.username} (${user.email})`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Created: ${user.created_at}`);
            console.log('');
        });

        console.log('\n=== CHECKING API QUERY (same as backend endpoint) ===\n');

        const apiQuery = await pool.query(`
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
            ORDER BY u.created_at DESC
        `);

        console.log(`Users returned by API query: ${apiQuery.rows.length}\n`);

        apiQuery.rows.forEach((user, index) => {
            console.log(`${index + 1}. ${user.username} (${user.email})`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Balance: $${user.balance}`);
            console.log(`   Orders: ${user.orders}`);
            console.log('');
        });

        console.log('\n=== FILTERING OUT ADMINS (as frontend does) ===\n');

        const nonAdmins = apiQuery.rows.filter(u => u.role !== 'admin');
        console.log(`Non-admin users that should appear in dashboard: ${nonAdmins.length}\n`);

        nonAdmins.forEach((user, index) => {
            console.log(`${index + 1}. ${user.username} (${user.email})`);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

verify();
