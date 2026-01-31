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
            SELECT status, COUNT(*) 
            FROM services 
            WHERE provider_id = 8 
            GROUP BY status
        `);
        console.log('EliteSMM service status stats:');
        res.rows.forEach(r => console.log(`- ${r.status}: ${r.count}`));

    } catch (err) {
        console.error('ERROR:', err);
    } finally {
        await client.end();
    }
}

check();
