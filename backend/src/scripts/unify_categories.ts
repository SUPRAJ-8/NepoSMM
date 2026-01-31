import pool from '../config/db';
import { sanitizeServiceName, getProviderAliases } from '../utils/sanitize';

const unifyCategories = async () => {
    try {
        console.log('Fetching all services and providers...');
        const providersRes = await pool.query('SELECT id, name FROM providers');
        const providersMap = new Map(providersRes.rows.map(p => [p.id, p.name]));

        const servicesRes = await pool.query('SELECT id, provider_id, category, display_category FROM services');
        console.log(`Processing ${servicesRes.rows.length} services...`);

        let updateCount = 0;
        const BATCH_SIZE = 100;
        let batch = [];

        for (const service of servicesRes.rows) {
            const providerName = providersMap.get(service.provider_id) || '';
            const providerAliases = getProviderAliases(providerName);

            const newDisplayCategory = sanitizeServiceName(service.category || '', providerName, providerAliases);

            if (newDisplayCategory !== service.display_category) {
                batch.push({ id: service.id, display_category: newDisplayCategory });
                updateCount++;
            }

            if (batch.length >= BATCH_SIZE) {
                await Promise.all(batch.map(item =>
                    pool.query('UPDATE services SET display_category = $1 WHERE id = $2', [item.display_category, item.id])
                ));
                console.log(`Updated ${updateCount} / ${servicesRes.rows.length}...`);
                batch = [];
            }
        }

        if (batch.length > 0) {
            await Promise.all(batch.map(item =>
                pool.query('UPDATE services SET display_category = $1 WHERE id = $2', [item.display_category, item.id])
            ));
        }

        console.log(`Successfully completed! Updated ${updateCount} services with unified display categories.`);
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await pool.end();
    }
};

unifyCategories();
