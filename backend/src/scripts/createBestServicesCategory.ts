
import { query } from '../config/db';

async function createCategory() {
    try {
        const providerId = 8; // EliteSMM
        const categoryName = 'NepoSmm Best Services';

        console.log(`Creating/Updating category: ${categoryName}`);

        // 1. Check if category exists
        const checkRes = await query("SELECT id FROM services WHERE category = $1 LIMIT 1", [categoryName]);

        if (checkRes.rows.length === 0) {
            console.log("Category does not exist. Creating placeholder service...");
            // Insert placeholder service
            await query(`
                INSERT INTO services (
                    name, category, provider_id, rate, min, max, 
                    external_service_id, status, type
                ) VALUES (
                    'Featured Service Placeholder', $1, $2, 0.00, 100, 1000, 
                    '999999', 'active', 'default'
                )
            `, [categoryName, providerId]);
            console.log("Placeholder service created.");
        } else {
            console.log("Category already exists.");
        }

        // 2. Set Sort Order to Top (-100)
        await query(`
            INSERT INTO category_configs (name, sort_order) 
            VALUES ($1, -100) 
            ON CONFLICT (name) DO UPDATE SET sort_order = -100
        `, [categoryName]);

        console.log("Sort order set to -100 (Top).");

    } catch (e) {
        console.error("Error:", e);
    }
}

createCategory();
