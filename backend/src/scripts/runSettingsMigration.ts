import { query } from '../config/db';
import fs from 'fs';
import path from 'path';

async function runMigration() {
    console.log('Starting settings table migration...');
    try {
        const migrationPath = path.join(process.cwd(), 'src', 'db', 'migrations', '007_create_settings_table.sql');
        const sql = fs.readFileSync(migrationPath, 'utf-8');

        console.log(`Executing SQL from ${migrationPath}...`);
        await query(sql);
        console.log('Migration successful: Settings table created/updated.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit();
    }
}

runMigration();
