const { Client } = require('pg');
require('dotenv').config();

async function check() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'category_configs')");
        console.log('category_configs exists:', res.rows[0].exists);

    } catch (err) {
        console.error('ERROR:', err);
    } finally {
        await client.end();
    }
}

check();
