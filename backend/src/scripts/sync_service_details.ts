import pool from '../config/db';

// Node 18+ has fetch, but for TS validation:
declare const fetch: any;

const fetchFromProvider = async (api_url: string, api_key: string, body: any) => {
    try {
        const response = await fetch(api_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                key: api_key.trim(),
                ...body
            }),
        });

        if (!response.ok) {
            throw new Error(`Provider API returned status ${response.status}.`);
        }

        const data = await response.json();
        return data;
    } catch (err: any) {
        throw new Error(err.message || 'Failed to connect to provider API');
    }
};

async function syncServiceDetails() {
    try {
        console.log('Fetching active providers...');
        const providersRes = await pool.query("SELECT * FROM providers WHERE status = 'active'");
        const providers = providersRes.rows;

        console.log(`Found ${providers.length} active providers.`);

        for (const provider of providers) {
            console.log(`\nSyncing services for provider: ${provider.name} (${provider.api_url})...`);
            try {
                const providerServices = await fetchFromProvider(provider.api_url, provider.api_key, { action: 'services' });

                if (!Array.isArray(providerServices)) {
                    console.error(`Invalid response from provider ${provider.name}: Expected array, got`, typeof providerServices);
                    continue;
                }

                console.log(`Provider returned ${providerServices.length} services.`);

                // Show sample service to see what fields are available
                if (providerServices.length > 0) {
                    const sample = providerServices.find((s: any) => s.desc || s.description) || providerServices[0];
                    console.log('\n=== Sample service from provider ===');
                    console.log(JSON.stringify(sample, null, 2));
                }

                let updatedAvgTime = 0;
                let updatedDesc = 0;

                for (const pService of providerServices) {
                    const updates: string[] = [];
                    const values: any[] = [];
                    let paramIndex = 1;

                    // Check if average_time exists
                    if (pService.average_time) {
                        updates.push(`average_time = $${paramIndex++}`);
                        values.push(pService.average_time);
                    }

                    // Check if description exists (could be 'desc' or 'description')
                    const description = pService.desc || pService.description;
                    if (description) {
                        updates.push(`description = $${paramIndex++}`);
                        values.push(description);
                    }

                    if (updates.length > 0) {
                        values.push(provider.id);
                        values.push(String(pService.service));

                        const updateQuery = `
                            UPDATE services 
                            SET ${updates.join(', ')}
                            WHERE provider_id = $${paramIndex++} 
                            AND external_service_id = $${paramIndex++}
                        `;

                        const updateRes = await pool.query(updateQuery, values);

                        if (updateRes.rowCount && updateRes.rowCount > 0) {
                            if (pService.average_time) updatedAvgTime++;
                            if (description) updatedDesc++;
                        }
                    }
                }

                console.log(`✓ Updated average_time for ${updatedAvgTime} services`);
                console.log(`✓ Updated description for ${updatedDesc} services`);

            } catch (error: any) {
                console.error(`Failed to sync provider ${provider.name}:`, error.message);
            }
        }

        console.log('\n✅ Sync completed successfully!');

    } catch (error) {
        console.error('Script failed:', error);
    } finally {
        await pool.end();
    }
}

syncServiceDetails();
