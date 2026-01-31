
import { query } from '../config/db';
import * as fs from 'fs';

async function checkOriginals() {
    let output = '';
    try {
        const res = await query('SELECT id, original_category, display_category FROM services WHERE id IN (7803, 8448)');
        res.rows.forEach(row => {
            output += `ID: ${row.id}, Original: "${row.original_category}", Display: "${row.display_category}"\n`;
        });
        fs.writeFileSync('original_cats.txt', output);
    } catch (err) {
        fs.writeFileSync('original_cats.txt', 'Error: ' + err);
    } finally {
        process.exit();
    }
}

checkOriginals();
