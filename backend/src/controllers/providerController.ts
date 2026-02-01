import { Request, Response } from 'express';
import { query } from '../config/db';
import { getCachedData, setCachedData, clearCache } from '../utils/cache';
import logger from '../utils/logger';


/**
 * Helper to fetch services from a real SMM provider API
 */
const fetchFromProvider = async (api_url: string, api_key: string, action: string) => {
    logger.info(`Calling provider: ${api_url} with action: ${action}`);


    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
        const response = await fetch(api_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            body: new URLSearchParams({
                key: api_key.trim(),
                action: action
            }),
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(`Provider API returned status ${response.status}.`);
        }

        const data = await response.json();

        if (data && data.error) {
            throw new Error(data.error);
        }

        return data;
    } catch (err: any) {
        if (err.name === 'AbortError') {
            throw new Error('Request to provider timed out after 30 seconds.');
        }
        throw new Error(err.message || 'Failed to connect to provider API');
    }
};

import { getExchangeRates } from './currencyController';
import { sanitizeServiceName, getProviderAliases } from '../utils/sanitize';

const convertToNPR = async (value: number, fromCurrency: string): Promise<number> => {
    const currencyKey = fromCurrency ? fromCurrency.toUpperCase().trim() : 'INR';

    // Optimization: If it's already NPR, return immediately
    if (currencyKey === 'NPR') return value;

    const rates = await getExchangeRates();
    const rate = rates[currencyKey] || (currencyKey === 'INR' ? 1.6 : 1.0); // Fallback to 1.6 for INR if missing

    const converted = value * rate;
    return converted;
};

export const performSync = async (providerId: number) => {
    logger.info(`[BACKGROUND SYNC] Starting sync for provider ${providerId}...`);

    try {
        await query('UPDATE providers SET sync_status = $1, sync_error = NULL WHERE id = $2', ['syncing', providerId]);

        const providerRes = await query('SELECT * FROM providers WHERE id = $1', [providerId]);
        if (providerRes.rows.length === 0) return;
        const provider = providerRes.rows[0];

        // 1. Sync Balance
        let balance = provider.balance;
        try {
            const balanceData = await fetchFromProvider(provider.api_url as string, provider.api_key as string, 'balance');
            balance = await convertToNPR(parseFloat(balanceData.balance || 0), provider.currency || 'INR');
        } catch (e) {
            logger.warn(`Could not sync balance for provider ${providerId}:`, e);
        }

        // 2. Sync Services
        const externalServices = await fetchFromProvider(provider.api_url as string, provider.api_key as string, 'services');

        if (!Array.isArray(externalServices)) {
            throw new Error('Invalid response format from provider (expected array of services)');
        }

        const existingServicesRes = await query('SELECT external_service_id, id FROM services WHERE provider_id = $1', [providerId]);
        const existingMap = new Map(existingServicesRes.rows.map(s => [s.external_service_id, s.id]));

        let addedCount = 0;
        let updatedCount = 0;
        const seenExternalIds = new Set<string>();

        await query('BEGIN');
        try {
            const CHUNK_SIZE = 50;
            for (let i = 0; i < externalServices.length; i += CHUNK_SIZE) {
                const chunk = externalServices.slice(i, i + CHUNK_SIZE);
                await Promise.all(chunk.map(async (extSvc: any) => {
                    const serviceId = (extSvc.service || extSvc.id || '').toString();
                    if (!serviceId) return;
                    seenExternalIds.add(serviceId);

                    // Pre-calculate rate for this service to ensure clean code in query
                    const convertedRate = await convertToNPR(parseFloat(extSvc.rate || 0), provider.currency || 'INR');

                    // Get provider aliases for comprehensive brand removal
                    const providerAliases = getProviderAliases(provider.name);

                    // Sanitize names ONCE during sync
                    const originalName = extSvc.name || '';
                    const originalCategory = extSvc.category || '';
                    const displayName = sanitizeServiceName(originalName, provider.name, providerAliases);
                    const displayCategory = sanitizeServiceName(originalCategory, provider.name, providerAliases);

                    if (existingMap.has(serviceId)) {
                        // Update existing service - preserve manual naming
                        const existingServiceRes = await query('SELECT display_name, display_category, status, original_name FROM services WHERE id = $1', [existingMap.get(serviceId)]);
                        const existingService = existingServiceRes.rows[0];

                        const wasManuallyRenamed = existingService?.display_name &&
                            existingService.display_name !== sanitizeServiceName(existingService.original_name || '', provider.name, providerAliases);

                        const finalDisplayName = wasManuallyRenamed ? existingService.display_name : displayName;
                        const finalDisplayCategory = existingService?.display_category || displayCategory;
                        const finalStatus = existingService?.status === 'inactive' ? 'inactive' : 'active';

                        await query(
                            `UPDATE services SET 
                                    name = $1, 
                                    original_name = $2,
                                    display_name = $3,
                                    category = $4,
                                    original_category = $5,
                                    display_category = $6,
                                    rate = $7, 
                                    min = $8, 
                                    max = $9, 
                                    type = $10, 
                                    status = $11, 
                                    description = $12, 
                                    average_time = $13, 
                                    guarantee = $14, 
                                    start_time = $15, 
                                    speed = $16 
                                WHERE id = $17`,
                            [
                                originalName,
                                originalName,
                                finalDisplayName,
                                originalCategory,
                                originalCategory,
                                finalDisplayCategory,
                                convertedRate,
                                parseInt(extSvc.min || 0),
                                parseInt(extSvc.max || 0),
                                extSvc.type || 'Default',
                                finalStatus,
                                extSvc.description || extSvc.desc || extSvc.detail || '',
                                extSvc.average_time || extSvc.time || extSvc.avg_time || 'N/A',
                                extSvc.guarantee || (extSvc.refill ? 'Refill Available' : 'No Refill') || 'N/A',
                                extSvc.start_time || extSvc.start || 'Instant',
                                extSvc.speed || 'Fast',
                                existingMap.get(serviceId)
                            ]
                        );
                        updatedCount++;
                    } else {
                        // New services - default to active and verified for better out-of-the-box experience
                        await query(
                            `INSERT INTO services (
                                    name, original_name, display_name,
                                    type, rate, min, max, 
                                    category, original_category, display_category,
                                    provider_id, external_service_id, 
                                    description, average_time, guarantee, start_time, speed, 
                                    status
                                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
                            [
                                originalName,
                                originalName,
                                displayName,
                                extSvc.type || 'Default',
                                convertedRate,
                                parseInt(extSvc.min || 0),
                                parseInt(extSvc.max || 0),
                                originalCategory,
                                originalCategory,
                                displayCategory,
                                providerId,
                                serviceId,
                                extSvc.description || extSvc.desc || extSvc.detail || '',
                                extSvc.average_time || extSvc.time || extSvc.avg_time || 'N/A',
                                extSvc.guarantee || (extSvc.refill ? 'Refill Available' : 'No Refill') || 'N/A',
                                extSvc.start_time || extSvc.start || 'Instant',
                                extSvc.speed || 'Fast',
                                'active'
                            ]
                        );
                        addedCount++;
                    }
                }));
            }
            await query('COMMIT');
        } catch (error) {
            await query('ROLLBACK');
            throw error;
        }

        // 3. Mark missing services as inactive
        const externalIdsToDeactivate = existingServicesRes.rows
            .filter(s => !seenExternalIds.has(s.external_service_id))
            .map(s => s.id);

        const deactivatedCount = externalIdsToDeactivate.length;
        if (externalIdsToDeactivate.length > 0) {
            await query('UPDATE services SET status = \'inactive\' WHERE id = ANY($1)', [externalIdsToDeactivate]);
        }

        // 4. Update provider metadata
        await query(
            'UPDATE providers SET last_sync = CURRENT_TIMESTAMP, balance = $1, sync_status = \'completed\', sync_error = NULL WHERE id = $2',
            [balance, providerId]
        );
        logger.info(`[BACKGROUND SYNC] Completed for provider ${providerId}. Added: ${addedCount}, Updated: ${updatedCount}, Deactivated: ${deactivatedCount}`);

        return {
            added: addedCount,
            updated: updatedCount,
            deactivated: deactivatedCount,
            totalProcessing: externalServices.length
        };

    } catch (error: any) {
        logger.error(`[BACKGROUND SYNC] Failed for provider ${providerId}:`, error);

        await query('UPDATE providers SET sync_status = $1, sync_error = $2 WHERE id = $3', ['failed', error.message, providerId]);
        throw error; // Re-throw to let the caller (worker) know it failed
    }
};

export const syncAllActiveProviders = async () => {
    logger.info('[AUTO SYNC] Starting scheduled sync for all active providers...');
    try {
        const result = await query('SELECT id FROM providers WHERE status = $1', ['active']);
        const providers = result.rows;

        logger.info(`[AUTO SYNC] Found ${providers.length} active providers.`);

        if (providers.length === 0) return;

        // Process sequentially to avoid overwhelming the DB or network, or use Promise.all for concurrency
        // Using sequential for safety
        for (const provider of providers) {
            try {
                await performSync(provider.id);
            } catch (err) {
                logger.error(`[AUTO SYNC] Failed for provider ${provider.id}`, err);
                // Continue with next provider
            }
        }
        logger.info('[AUTO SYNC] Completed all.');
    } catch (error) {
        logger.error('[AUTO SYNC] Fatal error fetching providers:', error);
    }
};



export const getProviders = async (req: Request, res: Response) => {
    const cacheKey = 'providers:all';
    try {
        const cached = await getCachedData(cacheKey);
        if (cached) return res.json(cached);

        const result = await query('SELECT * FROM providers ORDER BY created_at DESC');
        await setCachedData(cacheKey, result.rows, 300); // Cache for 5 mins

        // Prevent browser caching
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        res.json(result.rows);
    } catch (error) {
        logger.error('Error fetching providers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


export const addProvider = async (req: Request, res: Response) => {
    const { name, api_url, api_key, currency } = req.body;
    const providerCurrency = currency || 'INR';

    if (!name || !api_url || !api_key) {
        return res.status(400).json({ error: 'Name, API URL, and API Key are required' });
    }

    try {
        // Try to fetch balance first to validate details
        let balance = 0;
        try {
            const balanceData = await fetchFromProvider(api_url, api_key, 'balance');
            balance = parseFloat(balanceData.balance || 0);
        } catch (e) {
            logger.warn('Could not validate credentials via balance check:', e);

            return res.status(400).json({ error: 'Invalid API URL or API Key. Check the provider credentials.' });
        }

        const convertedBalance = await convertToNPR(balance, providerCurrency);

        const result = await query(
            'INSERT INTO providers (name, api_url, api_key, balance, currency, sync_status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, api_url.trim(), api_key.trim(), convertedBalance, providerCurrency, 'syncing']
        );

        const provider = result.rows[0];

        // Trigger background sync
        performSync(provider.id);

        // Clear providers cache
        await clearCache('providers:*');

        res.status(201).json({ message: 'Provider added. Services are being imported in the background.', provider });

    } catch (error) {
        logger.error('Error adding provider:', error);

        res.status(500).json({ error: 'Internal server error' });
    }
};


export const getProviderById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await query('SELECT * FROM providers WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Provider not found' });
        }

        const provider = result.rows[0];

        // Only return services if the provider is active
        // This ensures inactive providers don't show services in the dashboard or catalog
        let servicesList = [];
        if (provider.status === 'active') {
            const servicesResult = await query('SELECT * FROM services WHERE provider_id = $1', [id]);
            servicesList = servicesResult.rows;
        }

        res.json({
            ...provider,
            servicesList: servicesList
        });
    } catch (error) {
        logger.error('Error fetching provider details:', error);

        res.status(500).json({ error: 'Internal server error' });
    }
};

export const syncProvider = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const providerRes = await query('SELECT id, sync_status FROM providers WHERE id = $1', [id]);
        if (providerRes.rows.length === 0) {
            return res.status(404).json({ error: 'Provider not found' });
        }

        if (providerRes.rows[0].sync_status === 'syncing') {
            return res.status(400).json({ error: 'Sync already in progress' });
        }

        // Trigger background sync
        // Perform synchronous sync for manual trigger to return stats
        const idStr = Array.isArray(id) ? id[0] : id;
        const stats = await performSync(parseInt(idStr));

        res.json({
            message: 'Sync completed successfully.',
            ...stats
        });
    } catch (error) {
        logger.error('Error initiating sync:', error);

        res.status(500).json({ error: 'Internal server error' });
    }
};


export const toggleProviderStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    logger.info(`[toggleProviderStatus] Provider ID: ${id}, New Status: ${status}`);


    try {
        await query('UPDATE providers SET status = $1 WHERE id = $2', [status, id]);

        // Verify the update
        const result = await query('SELECT id, name, status FROM providers WHERE id = $1', [id]);
        logger.info('[toggleProviderStatus] Updated provider:', result.rows[0]);


        // Clear caches
        await clearCache('providers:*');
        await clearCache('services:*');

        res.json({ message: 'Provider status updated successfully' });
    } catch (error) {
        logger.error('Error updating provider status:', error);

        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateProvider = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, api_url, api_key } = req.body;

    // Build the set clause dynamically
    const fields = [];
    const values = [];
    let idx = 1;

    if (name) {
        fields.push(`name = $${idx++}`);
        values.push(name);
    }
    if (api_url) {
        fields.push(`api_url = $${idx++}`);
        values.push(api_url.trim());
    }
    if (api_key) {
        fields.push(`api_key = $${idx++}`);
        values.push(api_key.trim());
    }

    if (fields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const queryStr = `UPDATE providers SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;

    try {
        const result = await query(queryStr, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Provider not found' });
        }
        await clearCache('providers:*');
        await clearCache('services:*');
        res.json({ message: 'Provider updated successfully', provider: result.rows[0] });

    } catch (error) {
        logger.error('Error updating provider:', error);

        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteProvider = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await query('BEGIN');
        // Delete all services associated with this provider first
        await query('DELETE FROM services WHERE provider_id = $1', [id]);
        // Then delete the provider
        const result = await query('DELETE FROM providers WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            await query('ROLLBACK');
            return res.status(404).json({ error: 'Provider not found' });
        }

        await query('COMMIT');
        await clearCache('providers:*');
        await clearCache('services:*');
        res.json({ message: 'Provider and all associated services deleted successfully' });

    } catch (error) {
        await query('ROLLBACK');
        logger.error('Error deleting provider:', error);

        res.status(500).json({ error: 'Internal server error' });
    }
};

