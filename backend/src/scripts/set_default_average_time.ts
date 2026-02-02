import pool from '../config/db';

async function setDefaultAverageTime() {
    try {
        console.log('Setting default average_time for services...');

        // Update all services with N/A to a more realistic default
        const result = await pool.query(`
            UPDATE services 
            SET average_time = 'Not specified'
            WHERE average_time = 'N/A' OR average_time IS NULL
        `);

        console.log(`Updated ${result.rowCount} services with default average_time.`);

        // Show sample
        const sample = await pool.query(`
            SELECT id, name, average_time 
            FROM services 
            WHERE status = 'active' 
            LIMIT 5
        `);

        console.log('\nSample services:');
        console.table(sample.rows);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

setDefaultAverageTime();
