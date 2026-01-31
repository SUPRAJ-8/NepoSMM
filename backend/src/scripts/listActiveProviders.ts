
import { query } from '../config/db';

async function listProviders() {
    try {
        const res = await query("SELECT id, name, status FROM providers WHERE status = 'active' LIMIT 5");
        console.log("Active Providers:", res.rows);
    } catch (e) {
        console.error(e);
    }
}

listProviders();
