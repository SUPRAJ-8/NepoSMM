import pool from '../config/db';

async function quickUpdateAverageTime() {
    try {
        console.log('Quick update using SQL patterns...');

        // Update services with [Start: ...] pattern
        const r1 = await pool.query(`
            UPDATE services 
            SET average_time = SUBSTRING(name FROM '\\[Start:\\s*([^\\]]+)\\]')
            WHERE name ~* '\\[Start:' 
            AND status = 'active'
        `);
        console.log(`Updated ${r1.rowCount} services with [Start: ...] pattern`);

        // Update services with "Instant" in name
        const r2 = await pool.query(`
            UPDATE services 
            SET average_time = 'Instant'
            WHERE name ~* 'instant' 
            AND status = 'active'
            AND average_time = 'Not specified'
        `);
        console.log(`Updated ${r2.rowCount} services with "Instant"`);

        // Update services with "Fast" in name  
        const r3 = await pool.query(`
            UPDATE services 
            SET average_time = 'Fast'
            WHERE name ~* 'fast' 
            AND status = 'active'
            AND average_time = 'Not specified'
        `);
        console.log(`Updated ${r3.rowCount} services with "Fast"`);

        // Show samples
        const samples = await pool.query(`
            SELECT name, average_time 
            FROM services 
            WHERE status = 'active' AND average_time != 'Not specified'
            ORDER BY RANDOM()
            LIMIT 10
        `);

        console.log('\nSample services:');
        samples.rows.forEach(s => {
            console.log(`[${s.average_time}] ${s.name.substring(0, 70)}`);
        });

        console.log('\nDone!');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

quickUpdateAverageTime();
