const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function check() {
    try {
        console.log('Checking orders table columns...');
        const columns = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'orders'
        `);
        columns.rows.forEach(c => {
            console.log(`  - ${c.column_name} (${c.data_type})`);
        });
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

check();
