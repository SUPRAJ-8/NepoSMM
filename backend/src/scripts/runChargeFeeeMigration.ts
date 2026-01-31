import pool from '../config/db';
import fs from 'fs';
import path from 'path';

const runMigration = async () => {
    try {
        const migrationPath = path.join(__dirname, '../db/migrations/add_charge_fee_to_payment_methods.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        await pool.query(sql);
        console.log('Migration completed successfully: add_charge_fee_to_payment_methods');
    } catch (error) {
        console.error('Error running migration:', error);
    } finally {
        await pool.end();
    }
};

runMigration();
