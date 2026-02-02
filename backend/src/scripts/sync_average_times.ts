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

async function syncAverageTimes() {
    try {
        console.log('Fetching active providers...');
        const providersRes = await pool.query("SELECT * FROM providers WHERE status = 'active'");
        const providers = providersRes.rows;

        console.log(`Found ${providers.length} active providers.`);

        for (const provider of providers) {
            console.log(`Syncing services for provider: ${provider.name} (${provider.api_url})...`);
            try {
                const providerServices = await fetchFromProvider(provider.api_url, provider.api_key, { action: 'services' });

                if (!Array.isArray(providerServices)) {
                    console.error(`Invalid response from provider ${provider.name}: Expected array, got`, typeof providerServices);
                    continue;
                }

                console.log(`Provider returned ${providerServices.length} services.`);
                if (providerServices.length > 0) {
                    // Find a service that has average_time if possible
                    const withTime = providerServices.find((s: any) => s.average_time);
                    console.log('Sample service from provider:', JSON.stringify(withTime || providerServices[0], null, 2));
                }

                let updatedCount = 0;

                for (const pService of providerServices) {
                    // Check if average_time exists
                    if (pService.average_time) {
                        const updateRes = await pool.query(
                            `UPDATE services 
                             SET average_time = $1 
                             WHERE provider_id = $2 AND external_service_id = $3
                             AND average_time IS DISTINCT FROM $1`,
                            [pService.average_time, provider.id, String(pService.service)]
                        );
                        if (updateRes.rowCount && updateRes.rowCount > 0) updatedCount++;
                    }
                }

                console.log(`Updated average_time for ${updatedCount} services from ${provider.name}.`);

            } catch (error: any) {
                console.error(`Failed to sync provider ${provider.name}:`, error.message);
            }
        }

        console.log('Sync completed.');

    } catch (error) {
        console.error('Script failed:', error);
    } finally {
        await pool.end();
    }
}

syncAverageTimes();
