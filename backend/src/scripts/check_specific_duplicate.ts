
import { query } from '../config/db';
import * as fs from 'fs';

async function checkSpecificDuplicate() {
    let output = '';
    const log = (msg: string) => {
        console.log(msg);
        output += msg + '\n';
    };

    try {
        log('--- Searching for "Tiktok Services - Updated ⭐" ---');
        const res = await query(`
            SELECT id, name, original_name, category, original_category, display_category, provider_id, external_service_id
            FROM services 
            WHERE display_category LIKE '%Tiktok Services - Updated%'
        `);

        log(`Found ${res.rows.length} services with this category.`);
        res.rows.forEach(row => {
            log(`ID: ${row.id}, DisplayCat: "${row.display_category}", OrigCat: "${row.original_category}", Provider: ${row.provider_id}, ExtID: ${row.external_service_id}`);
        });

        log('\n--- Checking Unique display_category values ---');
        const uniqueCats = await query(`
            SELECT DISTINCT display_category 
            FROM services 
            WHERE display_category LIKE '%Tiktok Services - Updated%'
        `);
        uniqueCats.rows.forEach(row => {
            log(`- "${row.display_category}" (Length: ${row.display_category.length})`);
            // Check for hidden characters
            log(`  Hex: ${Buffer.from(row.display_category).toString('hex')}`);
        });

    } catch (err) {
        log('Error: ' + err);
    } finally {
        fs.writeFileSync('specific_duplicate_report.txt', output);
        process.exit();
    }
}

checkSpecificDuplicate();
