import pool from '../config/db';

async function extractAverageTimeFromNames() {
    try {
        console.log('Extracting average_time from service names...');

        const services = await pool.query(`
            SELECT id, name 
            FROM services 
            WHERE status = 'active'
        `);

        console.log(`Processing ${services.rows.length} services...`);

        const updates: Array<{ id: number, time: string }> = [];

        for (const service of services.rows) {
            const name = service.name;
            let extractedTime = null;

            // Pattern 1: [Start: X-Y Mins/Hours]
            const startPattern = /\[Start:\s*([^\]]+)\]/i;
            const startMatch = name.match(startPattern);
            if (startMatch) {
                extractedTime = startMatch[1].trim();
            }

            // Pattern 2: [X Hours/Mins]
            if (!extractedTime) {
                const timePattern = /\[(\d+[-\s]*\d*\s*(?:Hour|Minute|Min|Hr|Day)s?(?:\s*[-]\s*\d+\s*(?:Hour|Minute|Min|Hr|Day)s?)?)\]/i;
                const timeMatch = name.match(timePattern);
                if (timeMatch) {
                    extractedTime = timeMatch[1].trim();
                }
            }

            // Pattern 3: Instant/Fast in name
            if (!extractedTime) {
                if (name.toLowerCase().includes('instant')) {
                    extractedTime = 'Instant';
                } else if (name.toLowerCase().includes('fast')) {
                    extractedTime = 'Fast';
                }
            }

            if (extractedTime) {
                updates.push({ id: service.id, time: extractedTime });
            }
        }

        console.log(`Found ${updates.length} services with extractable time info.`);
        console.log('Updating in batch...');

        // Batch update
        for (const update of updates) {
            await pool.query(
                'UPDATE services SET average_time = $1 WHERE id = $2',
                [update.time, update.id]
            );
        }

        console.log(`Updated ${updates.length} services.`);

        // Show samples
        const samples = await pool.query(`
            SELECT id, name, average_time 
            FROM services 
            WHERE status = 'active' AND average_time != 'Not specified'
            ORDER BY RANDOM()
            LIMIT 10
        `);

        console.log('\nSample services with extracted times:');
        samples.rows.forEach(s => {
            console.log(`[${s.average_time}] ${s.name.substring(0, 80)}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

extractAverageTimeFromNames();
