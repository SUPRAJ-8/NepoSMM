require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function check() {
    try {
        const res = await pool.query(`
            SELECT id, name, average_time, LEFT(description, 100) as description_preview 
            FROM services 
            WHERE status = 'active' 
            AND description IS NOT NULL 
            AND description != '' 
            LIMIT 5
        `);
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

check();
