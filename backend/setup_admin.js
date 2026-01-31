const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function setup() {
    const username = 'neposmm-8';
    const email = 'admin@neposmm.com';
    const password = '9866887714';
    const role = 'admin';

    try {
        console.log('Hashing password...');
        const hashed = await bcrypt.hash(password, 10);

        console.log('Checking if user exists...');
        const check = await pool.query("SELECT id FROM users WHERE username = $1", [username]);

        if (check.rows.length > 0) {
            console.log('User exists, updating role and password...');
            await pool.query(
                "UPDATE users SET password = $1, role = $2 WHERE username = $3",
                [hashed, role, username]
            );
        } else {
            console.log('User not found, creating...');
            await pool.query(
                "INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)",
                [username, email, hashed, role]
            );
        }
        console.log('Admin user setup complete!');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

setup();
