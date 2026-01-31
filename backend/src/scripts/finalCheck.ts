import { query } from '../config/db';

async function finalCheck() {
    try {
        const result = await query('SELECT id, balance, currency FROM providers');
        console.log('RAW_START');
        console.log(JSON.stringify(result.rows));
        console.log('RAW_END');
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

finalCheck();
