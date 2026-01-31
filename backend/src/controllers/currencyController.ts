import { Request, Response } from 'express';
import { query } from '../config/db';
import { getCachedData, setCachedData, clearCache } from '../utils/cache';
import logger from '../utils/logger';

// Helper to get all rates (cached)
export const getExchangeRates = async (): Promise<Record<string, number>> => {
    const cacheKey = 'exchange_rates';
    const cached = await getCachedData(cacheKey);
    if (cached) return cached as Record<string, number>;

    const result = await query('SELECT code, rate FROM currencies');
    const rates: Record<string, number> = {};
    result.rows.forEach((row: any) => {
        rates[row.code] = parseFloat(row.rate);
    });

    await setCachedData(cacheKey, rates, 3600); // Cache for 1 hour
    return rates;
};

// API Endpoint to get rates
export const getRates = async (req: Request, res: Response) => {
    try {
        const rates = await getExchangeRates();
        res.json(rates);
    } catch (error) {
        logger.error('Error fetching rates:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// API Endpoint to update a specific rate manually
export const updateRate = async (req: Request, res: Response) => {
    const { code, rate } = req.body;
    try {
        await query('INSERT INTO currencies (code, rate) VALUES ($1, $2) ON CONFLICT (code) DO UPDATE SET rate = $2, last_updated = CURRENT_TIMESTAMP', [code, rate]);
        await clearCache('exchange_rates');
        res.json({ message: 'Rate updated successfully' });
    } catch (error) {
        logger.error('Error updating rate:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Function to fetch live rates (mock implementation for now, or use open API)
export const fetchLiveRates = async () => {
    logger.info('Fetching live exchange rates...');
    try {
        // Example: Fetch from an open API (e.g., frankfurter, exchangerate-api)
        // Since most need a base currency, and we want NPR, we might need to triangulate or find a direct source.
        // For simplicity/stability in this demo, we'll keep the values stable or assume a mock updates them.
        // In a real scenario:
        // const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        // const data = await response.json();
        // ... calculate NPR rates based on USD/NPR ...

        // For now, let's just log. The user can manually update or we hook up a specific API they have.
        logger.info('Live rate fetch placeholder executed.');
    } catch (error) {
        logger.error('Failed to fetch live rates:', error);
    }
};
