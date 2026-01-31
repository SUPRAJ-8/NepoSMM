const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function check() {
    try {
        console.log('Checking tables...');
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Tables:', tables.rows.map(r => r.table_name).join(', '));

        for (const table of tables.rows) {
            console.log(`\nColumns for ${table.table_name}:`);
            const columns = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1
            `, [table.table_name]);
            columns.rows.forEach(c => {
                console.log(`  - ${c.column_name} (${c.data_type})`);
            });
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

check();
