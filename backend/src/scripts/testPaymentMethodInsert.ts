import pool from '../config/db';

const testInsert = async () => {
    try {
        console.log('Testing INSERT with charge_fee_percentage...');
        const result = await pool.query(
            `INSERT INTO payment_methods (name, description, type, bonus_percentage, charge_fee_percentage, instructions, qr_code_url, is_active) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            ['Test Method', 'Test Description', 'crypto', 5.0, 2.0, '["Test instruction"]', '', true]
        );
        console.log('SUCCESS: Payment method created:', result.rows[0]);
    } catch (error: any) {
        console.error('ERROR creating payment method:');
        console.error('Message:', error.message);
        console.error('Code:', error.code);
        console.error('Position:', error.position);

        // Try without charge_fee_percentage
        console.log('\nTrying INSERT without charge_fee_percentage...');
        try {
            const result2 = await pool.query(
                `INSERT INTO payment_methods (name, description, type, bonus_percentage, instructions, qr_code_url, is_active) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                ['Test Method 2', 'Test Description', 'crypto', 5.0, '["Test instruction"]', '', true]
            );
            console.log('SUCCESS without charge_fee_percentage:', result2.rows[0]);
        } catch (err2: any) {
            console.error('Also failed without charge_fee_percentage:', err2.message);
        }
    } finally {
        await pool.end();
    }
};

testInsert();
