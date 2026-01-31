
import { query } from '../config/db';
import * as fs from 'fs';

async function checkDuplicates() {
    let output = '';
    const log = (msg: string) => {
        console.log(msg);
        output += msg + '\n';
    };

    try {
        log('--- Checking for Duplicate Categories (display_category) ---');
        const catRes = await query(`
            SELECT display_category, COUNT(*) as count 
            FROM services 
            GROUP BY display_category 
            HAVING COUNT(*) > 1
            ORDER BY count DESC
        `);

        log(`Found ${catRes.rows.length} category names that are shared by multiple services.`);

        log('\n--- Checking for Potential Duplicate Services (same name and category) ---');
        const svcRes = await query(`
            SELECT display_name, display_category, COUNT(*) as count, ARRAY_AGG(provider_id) as providers, ARRAY_AGG(id) as ids
            FROM services 
            WHERE status = 'active'
            GROUP BY display_name, display_category 
            HAVING COUNT(*) > 1
            ORDER BY count DESC
            LIMIT 50
        `);

        svcRes.rows.forEach(row => {
            log(`Service: "${row.display_name}" in Category: "${row.display_category}" - Count: ${row.count} - Providers: ${row.providers} - IDs: ${row.ids}`);
        });

        log('\n--- Checking for exact Duplicate external_service_id for same provider ---');
        const extRes = await query(`
            SELECT external_service_id, provider_id, COUNT(*) as count
            FROM services 
            GROUP BY external_service_id, provider_id
            HAVING COUNT(*) > 1
        `);
        log(`Found ${extRes.rows.length} duplicate external_service_ids for the same provider.`);
        extRes.rows.forEach(row => {
            log(`External ID: ${row.external_service_id} - Provider: ${row.provider_id} - Count: ${row.count}`);
        });

    } catch (err) {
        log('Error checking duplicates: ' + err);
    } finally {
        fs.writeFileSync('duplicate_report.txt', output);
        process.exit();
    }
}

checkDuplicates();
