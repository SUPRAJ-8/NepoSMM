import pool from '../config/db';

const listColumns = async () => {
    try {
        const result = await pool.query(`
            SELECT column_name
            FROM information_schema.columns 
            WHERE table_name = 'payment_methods'
            ORDER BY ordinal_position;
        `);
        console.log('Columns in payment_methods:');
        result.rows.forEach(row => console.log('  -', row.column_name));

        // Now try the actual insert
        console.log('\nAttempting INSERT...');
        const insertResult = await pool.query(
            `INSERT INTO payment_methods (name, description, type, bonus_percentage, charge_fee_percentage, instructions, is_active) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            ['Test Payment', 'Test Desc', 'crypto', 5, 2, '["instruction 1"]', true]
        );
        console.log('SUCCESS! Created:', insertResult.rows[0]);

    } catch (error: any) {
        console.error('ERROR:', error.message);
    } finally {
        await pool.end();
    }
};

listColumns();
