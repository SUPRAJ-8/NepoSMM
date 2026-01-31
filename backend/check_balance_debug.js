const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkBalance() {
    try {
        console.log('--- RECENT DEPOSIT TRANSACTIONS ---');
        const txs = await pool.query(`
            SELECT t.id, t.user_id, u.username, t.amount, t.type, t.status, u.balance 
            FROM transactions t
            JOIN users u ON t.user_id = u.id
            WHERE t.type = 'deposit'
            ORDER BY t.created_at DESC 
            LIMIT 5
        `);
        console.log(JSON.stringify(txs.rows, null, 2));

        console.log('\n--- ALL USERS BALANCE ---');
        const users = await pool.query('SELECT id, username, balance FROM users');
        console.log(JSON.stringify(users.rows, null, 2));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkBalance();
