
import { query } from '../config/db';
import * as fs from 'fs';

async function checkTiktokServices() {
    let output = '';
    const log = (msg: string) => {
        console.log(msg);
        output += msg + '\n';
    };

    try {
        log('--- Services under "Tiktok Services - 𝗨𝗽𝗱𝗮𝘁𝗲𝗱 ⭐" ---');
        const res1 = await query(`
            SELECT id, display_name, rate, external_service_id
            FROM services 
            WHERE display_category = 'Tiktok Services - 𝗨𝗽𝗱𝗮𝘁𝗲𝗱 ⭐'
            ORDER BY display_name
        `);
        res1.rows.forEach(row => {
            log(`ID: ${row.id}, Name: "${row.display_name}", Rate: ${row.rate}, ExtID: ${row.external_service_id}`);
        });

        log('\n--- Services under "Tiktok Services - 𝗨𝗽𝗱𝗮𝘁𝗲𝗱 ⭐f" ---');
        const res2 = await query(`
            SELECT id, display_name, rate, external_service_id
            FROM services 
            WHERE display_category = 'Tiktok Services - 𝗨𝗽𝗱𝗮𝘁𝗲𝗱 ⭐f'
            ORDER BY display_name
        `);
        res2.rows.forEach(row => {
            log(`ID: ${row.id}, Name: "${row.display_name}", Rate: ${row.rate}, ExtID: ${row.external_service_id}`);
        });

    } catch (err) {
        log('Error: ' + err);
    } finally {
        fs.writeFileSync('tiktok_services_detail.txt', output);
        process.exit();
    }
}

checkTiktokServices();
