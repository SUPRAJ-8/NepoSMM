import pool from '../config/db';

const showDbInfo = async () => {
    try {
        // Show current database
        const dbResult = await pool.query('SELECT current_database()');
        console.log('Connected to database:', dbResult.rows[0].current_database);

        // Check if payment_methods table exists
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'payment_methods'
            );
        `);
        console.log('payment_methods table exists:', tableCheck.rows[0].exists);

        // List all tables
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        console.log('\nAll tables in database:');
        tables.rows.forEach(row => console.log('  -', row.table_name));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
};

showDbInfo();
