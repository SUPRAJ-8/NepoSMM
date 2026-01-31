import pool from '../config/db';
import fs from 'fs';

const checkServices = async () => {
    try {
        const counts = await pool.query('SELECT status, COUNT(*) as count FROM services GROUP BY status');
        let output = '\nService Counts by Status:\n' + JSON.stringify(counts.rows, null, 2);

        const sample = await pool.query('SELECT id, name, category, status FROM services LIMIT 20');
        output += '\n\nSample Services:\n' + sample.rows.map(r => `${r.id} | ${r.status} | ${r.category} | ${r.name}`).join('\n');

        fs.writeFileSync('debug_results.txt', output);
        console.log('Results written to debug_results.txt');
    } catch (error: any) {
        console.error('Error:', error);
        fs.writeFileSync('debug_results.txt', 'Error: ' + error.message);
    } finally {
        await pool.end();
    }
};

checkServices();
