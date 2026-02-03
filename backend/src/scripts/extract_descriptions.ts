import pool from '../config/db';

async function extractDescriptionFromNames() {
    try {
        console.log('Extracting description from service names...');

        const services = await pool.query(`
            SELECT id, name 
            FROM services 
            WHERE status = 'active'
        `);

        console.log(`Processing ${services.rows.length} services...`);

        const updates: Array<{ id: number, description: string }> = [];

        for (const service of services.rows) {
            const name = service.name;

            // Extract key information from the service name
            const details: string[] = [];

            // Extract refill info
            if (name.match(/\[.*?Refill.*?\]/i)) {
                const refillMatch = name.match(/\[(.*?Refill.*?)\]/i);
                if (refillMatch) details.push(refillMatch[1].trim());
            } else if (name.toLowerCase().includes('no refill')) {
                details.push('No Refill');
            }

            // Extract speed info
            const speedMatch = name.match(/\[.*?(\d+k?[-\/]\d+k?\/day).*?\]/i);
            if (speedMatch) {
                details.push(`Speed: ${speedMatch[1]}`);
            }

            // Extract quality info
            const qualityMatch = name.match(/\[(HQ|High Quality|Premium|Good Quality|Best Quality)\]/i);
            if (qualityMatch) {
                details.push(qualityMatch[1]);
            }

            // Extract guarantee info
            const guaranteeMatch = name.match(/\[.*?(Guaranteed|Guarantee).*?\]/i);
            if (guaranteeMatch) {
                details.push(guaranteeMatch[1]);
            }

            // Extract max info
            const maxMatch = name.match(/\[Max\s+(\d+[KkMm]?)\]/i);
            if (maxMatch) {
                details.push(`Max: ${maxMatch[1]}`);
            }

            // Create description from extracted details
            if (details.length > 0) {
                const description = details.join(' | ');
                updates.push({ id: service.id, description });
            } else {
                // If no specific details found, use a generic description based on the service name
                const cleanName = name.replace(/[🔥⭐🎉💎✨🚀⚡💯🌟]/g, '').trim();
                updates.push({ id: service.id, description: cleanName });
            }
        }

        console.log(`Found ${updates.length} services to update with descriptions.`);
        console.log('Updating in batch...');

        // Batch update
        for (const update of updates) {
            await pool.query(
                'UPDATE services SET description = $1 WHERE id = $2',
                [update.description, update.id]
            );
        }

        console.log(`Updated ${updates.length} services.`);

        // Show samples
        const samples = await pool.query(`
            SELECT id, name, description 
            FROM services 
            WHERE status = 'active' AND description IS NOT NULL AND description != ''
            ORDER BY RANDOM()
            LIMIT 10
        `);

        console.log('\nSample services with extracted descriptions:');
        samples.rows.forEach(s => {
            console.log(`\nID: ${s.id}`);
            console.log(`Name: ${s.name.substring(0, 80)}`);
            console.log(`Description: ${s.description.substring(0, 100)}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

extractDescriptionFromNames();
