
import { query } from '../config/db';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../../.env') });

const checkColumns = async () => {
    try {
        const result = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
        console.log('Columns in users table:');
        console.log(result.rows.map(r => r.column_name));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
};

checkColumns();
