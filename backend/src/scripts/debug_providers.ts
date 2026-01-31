import pool from '../config/db';
import fs from 'fs';

const checkProviders = async () => {
    try {
        const res = await pool.query('SELECT id, name, status FROM providers');
        const output = '\nProviders:\n' + JSON.stringify(res.rows, null, 2);

        fs.writeFileSync('debug_providers.txt', output);
        console.log('Results written to debug_providers.txt');
    } catch (error: any) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
};

checkProviders();
