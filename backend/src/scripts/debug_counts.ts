import pool from '../config/db';
import fs from 'fs';

const checkCategoryCounts = async () => {
    try {
        const query = `
            SELECT category, COUNT(*) as count 
            FROM services 
            WHERE status = 'active'
            GROUP BY category
            ORDER BY count DESC
        `;
        const res = await pool.query(query);
        fs.writeFileSync('debug_counts.txt', JSON.stringify(res.rows, null, 2));
        console.log('Results written to debug_counts.txt');
    } catch (error: any) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
};

checkCategoryCounts();
