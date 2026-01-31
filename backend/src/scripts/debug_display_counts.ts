import pool from '../config/db';
import fs from 'fs';

const checkDisplayCategoryCounts = async () => {
    try {
        const query = `
            SELECT 
                COALESCE(s.display_category, s.category) as category_name,
                COUNT(*) as count 
            FROM services s
            GROUP BY COALESCE(s.display_category, s.category)
            ORDER BY count DESC
        `;
        const res = await pool.query(query);
        fs.writeFileSync('debug_display_counts.txt', JSON.stringify(res.rows, null, 2));
        console.log('Results written to debug_display_counts.txt');
    } catch (error: any) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
};

checkDisplayCategoryCounts();
