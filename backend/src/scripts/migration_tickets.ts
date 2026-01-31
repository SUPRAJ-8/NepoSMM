import pool from '../config/db';
import fs from 'fs';
import path from 'path';

const runMigration = async () => {
    try {
        const sqlPath = path.join(__dirname, '../db/migrations/008_create_tickets_table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await pool.query(sql);
        console.log('Tickets migration executed successfully');
    } catch (error) {
        console.error('Error executing tickets migration:', error);
    } finally {
        await pool.end();
    }
};

runMigration();
