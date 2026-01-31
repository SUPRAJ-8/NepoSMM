import pool from '../config/db';

const addSortOrderColumn = async () => {
    try {
        console.log('Adding sort_order column to payment_methods...');
        await pool.query(`
            ALTER TABLE payment_methods 
            ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
        `);
        console.log('Successfully added sort_order column.');

        // Initialize sort_order with id to maintain current order
        await pool.query(`
            UPDATE payment_methods SET sort_order = id WHERE sort_order = 0;
        `);
        console.log('Initialized sort_order values.');
    } catch (error) {
        console.error('Error adding sort_order column:', error);
    } finally {
        await pool.end();
    }
};

addSortOrderColumn();
