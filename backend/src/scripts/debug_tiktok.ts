import pool from '../config/db';
import fs from 'fs';

const checkTiktokServices = async () => {
    try {
        const query = `
            SELECT id, name, category, display_category, status 
            FROM services 
            WHERE category ILIKE '%tiktok%' OR display_category ILIKE '%tiktok%'
        `;
        const res = await pool.query(query);
        const output = '\nTiktok Services Details:\n' + JSON.stringify(res.rows, null, 2);

        fs.writeFileSync('debug_tiktok.txt', output);
        console.log('Results written to debug_tiktok.txt');
    } catch (error: any) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
};

checkTiktokServices();
