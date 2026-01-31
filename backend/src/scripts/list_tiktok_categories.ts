
import { query } from '../config/db';
import * as fs from 'fs';

async function listAllCategories() {
    let output = '';
    const log = (msg: string) => {
        console.log(msg);
        output += msg + '\n';
    };

    try {
        log('--- All Unique display_category values containing "tiktok" (case insensitive) ---');
        const res = await query(`
            SELECT DISTINCT display_category 
            FROM services 
            WHERE display_category ILIKE '%tiktok%'
            ORDER BY display_category
        `);

        res.rows.forEach(row => {
            log(`- "${row.display_category}" (Length: ${row.display_category.length})`);
            log(`  Hex: ${Buffer.from(row.display_category).toString('hex')}`);
        });

    } catch (err) {
        log('Error: ' + err);
    } finally {
        fs.writeFileSync('all_tiktok_categories.txt', output);
        process.exit();
    }
}

listAllCategories();
