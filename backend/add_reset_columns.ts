import { query } from './src/config/db';

async function addResetTokenColumns() {
    try {
        console.log('Adding reset_token and reset_token_expiry to users table...');

        // Check if columns already exist
        const checkResult = await query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name IN ('reset_token', 'reset_token_expiry')
        `);

        if (checkResult.rows.length === 2) {
            console.log('Columns already exist.');
            process.exit(0);
        }

        if (checkResult.rows.length === 1) {
            console.log('One of the columns exists. This is unexpected. Please check manually.');
            process.exit(1);
        }

        await query(`
            ALTER TABLE users 
            ADD COLUMN reset_token TEXT,
            ADD COLUMN reset_token_expiry TIMESTAMP WITH TIME ZONE
        `);

        console.log('Columns added successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error adding columns:', err);
        process.exit(1);
    }
}

addResetTokenColumns();
