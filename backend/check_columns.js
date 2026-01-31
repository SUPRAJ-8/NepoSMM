const { Client } = require('pg');
require('dotenv').config();

async function check() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'services'
        `);
        console.log('Columns for services table:');
        res.rows.forEach(r => console.log(`- ${r.column_name}`));

    } catch (err) {
        console.error('ERROR:', err);
    } finally {
        await client.end();
    }
}

check();
