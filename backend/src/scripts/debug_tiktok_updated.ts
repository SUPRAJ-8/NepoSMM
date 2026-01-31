import pool from '../config/db';
import fs from 'fs';

const checkTiktokUpdated = async () => {
    try {
        const query = `
            SELECT id, name, category, display_category, status 
            FROM services 
            WHERE category = 'Tiktok Services - 𝗨𝗽𝗱𝗮𝘁𝗲𝗱 ⭐'
        `;
        const res = await pool.query(query);
        const output = '\nTiktok Updated Details:\n' + JSON.stringify(res.rows, null, 2);

        fs.writeFileSync('debug_tiktok_updated.txt', output);
        console.log('Results written to debug_tiktok_updated.txt');
    } catch (error: any) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
};

checkTiktokUpdated();
