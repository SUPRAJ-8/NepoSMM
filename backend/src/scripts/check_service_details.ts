import pool from '../config/db';

async function checkServiceDetails() {
    try {
        console.log('Checking service details (average_time and description)...\n');

        // Get a sample of services with their details
        const result = await pool.query(`
            SELECT 
                id, 
                name, 
                category,
                average_time, 
                description,
                guarantee,
                start_time,
                speed
            FROM services 
            WHERE status = 'active'
            ORDER BY id ASC
            LIMIT 10
        `);

        console.log(`Found ${result.rows.length} active services.\n`);

        result.rows.forEach((service, index) => {
            console.log(`\n--- Service ${index + 1} ---`);
            console.log(`ID: ${service.id}`);
            console.log(`Name: ${service.name}`);
            console.log(`Category: ${service.category}`);
            console.log(`Average Time: ${service.average_time || 'NULL'}`);
            console.log(`Description: ${service.description ? service.description.substring(0, 100) + '...' : 'NULL'}`);
            console.log(`Guarantee: ${service.guarantee || 'NULL'}`);
            console.log(`Start Time: ${service.start_time || 'NULL'}`);
            console.log(`Speed: ${service.speed || 'NULL'}`);
        });

        // Count how many services have these fields populated
        const stats = await pool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(average_time) as has_avg_time,
                COUNT(description) as has_description,
                COUNT(guarantee) as has_guarantee,
                COUNT(start_time) as has_start_time,
                COUNT(speed) as has_speed
            FROM services 
            WHERE status = 'active'
        `);

        console.log('\n\n--- Statistics ---');
        console.log(`Total active services: ${stats.rows[0].total}`);
        console.log(`Services with average_time: ${stats.rows[0].has_avg_time}`);
        console.log(`Services with description: ${stats.rows[0].has_description}`);
        console.log(`Services with guarantee: ${stats.rows[0].has_guarantee}`);
        console.log(`Services with start_time: ${stats.rows[0].has_start_time}`);
        console.log(`Services with speed: ${stats.rows[0].has_speed}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

checkServiceDetails();
