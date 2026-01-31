
import { query } from '../config/db';

async function cleanup() {
    try {
        const merges = [
            { from: 'Tiktok Services - 𝗨𝗽𝗱𝗮𝘁𝗲𝗱 ⭐f', to: 'Tiktok Services - 𝗨𝗽𝗱𝗮𝘁𝗲𝗱 ⭐' },
            { from: 'Youtube Views', to: 'YouTube Views' },
            { from: 'Tiktok Followers', to: 'TikTok Followers' },
            { from: 'Youtube Subscribers', to: 'YouTube Subscribers' }
        ];

        console.log('--- Merging Specific Categories ---');
        for (const m of merges) {
            const res = await query('UPDATE services SET display_category = $1 WHERE display_category = $2', [m.to, m.from]);
            if (res.rowCount && res.rowCount > 0) {
                console.log(`Merged "${m.from}" into "${m.to}" (${res.rowCount} services).`);
            }
        }

        console.log('\n--- Identifying Exact Duplicate Services to Deactivate ---');
        const groupsRes = await query(`
            SELECT display_name, display_category, provider_id, rate, ARRAY_AGG(id ORDER BY id ASC) as ids
            FROM services 
            WHERE status = 'active'
            GROUP BY display_name, display_category, provider_id, rate 
            HAVING COUNT(*) > 1
        `);

        console.log(`Found ${groupsRes.rows.length} groups of duplicates.`);

        let deactivatedCount = 0;
        for (const group of (groupsRes.rows as any[])) {
            const ids = group.ids;

            const orderCounts = await Promise.all(ids.map(async (id: number) => {
                const res = await query('SELECT COUNT(*) as count FROM orders WHERE service_id = $1', [id]);
                return { id, count: parseInt((res.rows[0] as any).count) };
            }));

            orderCounts.sort((a, b) => b.count - a.count || a.id - b.id);

            const keepId = orderCounts[0].id;
            const deactivateIds = ids.filter((id: number) => id !== keepId);

            if (deactivateIds.length > 0) {
                console.log(`Group: "${group.display_name}" - Keeping ID ${keepId}, deactivating [${deactivateIds}]`);
                await query('UPDATE services SET status = $1 WHERE id = ANY($2)', ['inactive', deactivateIds]);
                deactivatedCount += deactivateIds.length;
            }
        }

        console.log(`\nDeactivated ${deactivatedCount} duplicate services.`);

    } catch (err) {
        console.error('Error during cleanup:', err);
    } finally {
        process.exit();
    }
}

cleanup();
