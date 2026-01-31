const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function fixRole() {
    try {
        console.log('Updating supraj-8 role to "user"...');

        const result = await pool.query(
            "UPDATE users SET role = 'user' WHERE username = 'supraj-8' RETURNING username, email, role"
        );

        if (result.rows.length > 0) {
            console.log('✓ Successfully updated:');
            console.log(`  Username: ${result.rows[0].username}`);
            console.log(`  Email: ${result.rows[0].email}`);
            console.log(`  Role: ${result.rows[0].role}`);
        } else {
            console.log('User not found');
        }

        console.log('\nVerifying all users:');
        const allUsers = await pool.query('SELECT username, email, role FROM users ORDER BY username');
        allUsers.rows.forEach(u => {
            console.log(`- ${u.username} | ${u.email} | ${u.role}`);
        });

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

fixRole();
