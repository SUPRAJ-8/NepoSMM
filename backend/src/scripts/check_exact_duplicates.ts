
import { query } from '../config/db';
import * as fs from 'fs';

async function checkExactDuplicateServices() {
    let output = '';
    const log = (msg: string) => {
        console.log(msg);
        output += msg + '\n';
    };

    try {
        log('--- Checking for Exact Duplicate Services (same name, category, and rate) ---');
        const res = await query(`
            SELECT display_name, display_category, rate, COUNT(*) as count, ARRAY_AGG(id) as ids, ARRAY_AGG(provider_id) as providers
            FROM services 
            WHERE status = 'active'
            GROUP BY display_name, display_category, rate 
            HAVING COUNT(*) > 1
            ORDER BY count DESC
        `);

        log(`Found ${res.rows.length} sets of exact duplicate services.`);
        res.rows.forEach(row => {
            log(`Service: "${row.display_name}" | Cat: "${row.display_category}" | Rate: ${row.rate} | Count: ${row.count} | IDs: ${row.ids} | Providers: ${row.providers}`);
        });

    } catch (err) {
        log('Error: ' + err);
    } finally {
        fs.writeFileSync('exact_duplicate_services.txt', output);
        process.exit();
    }
}

checkExactDuplicateServices();
