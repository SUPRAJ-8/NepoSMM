import pool from '../config/db';
import fs from 'fs';
import path from 'path';

const initDb = async () => {
    try {
        const sqlPath = path.join(__dirname, '../db/init.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await pool.query(sql);
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        await pool.end();
    }
};

initDb();
