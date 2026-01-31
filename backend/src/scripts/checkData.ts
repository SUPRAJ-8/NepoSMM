import { query } from '../config/db';

async function checkData() {
    try {
        const providers = await query('SELECT id, name, balance, currency FROM providers');
        console.log('DATA_START');
        console.log(JSON.stringify(providers.rows));
        console.log('DATA_END');
    } catch (err) {
        console.error('Error checking data:', err);
    } finally {
        process.exit();
    }
}

checkData();
