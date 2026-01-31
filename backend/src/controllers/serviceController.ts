import { Request, Response } from 'express';
import { query } from '../config/db';
import { getCachedData, setCachedData, clearCache } from '../utils/cache';
import logger from '../utils/logger';


export const getServices = async (req: Request, res: Response) => {
    const { status } = req.query;
    const cacheKey = `services:${status || 'all'}`;

    try {
        const cached = await getCachedData(cacheKey);
        if (cached) return res.json(cached);

        let queryStr = `
            SELECT 
                s.id, 
                COALESCE(s.display_name, s.name) as name,
                COALESCE(s.display_category, s.category) as category,
                s.rate, s.min, s.max, 
                s.provider_id, s.external_service_id, s.status,
                s.average_time, s.guarantee, s.start_time, s.speed,
                s.margin, s.description,
                p.name as provider_name
            FROM services s
            INNER JOIN providers p ON s.provider_id = p.id
            LEFT JOIN category_configs cc ON COALESCE(s.display_category, s.category) = cc.name
            WHERE p.status = 'active'
        `;
        const params: any[] = [];

        if (status) {
            queryStr += ' AND s.status = $1';
            params.push(status);
        }

        queryStr += ' ORDER BY COALESCE(cc.sort_order, 0) ASC, (CASE WHEN COALESCE(s.display_category, s.category) LIKE \'%⭐%\' THEN 0 ELSE 1 END) ASC, category ASC, s.id ASC';

        const result = await query(queryStr, params);
        await setCachedData(cacheKey, result.rows, 300); // 5 mins

        // Prevent browser caching
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        res.json(result.rows);
    } catch (error) {
        logger.error('Error fetching services:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


export const updateService = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, category, rate, min, max, status, description, average_time, guarantee, start_time, speed, margin } = req.body;
    try {
        await query(
            'UPDATE services SET name = $1, category = $2, rate = $3, min = $4, max = $5, status = $6, description = $7, average_time = $8, guarantee = $9, start_time = $10, speed = $11, margin = $12 WHERE id = $13',
            [name, category, rate, min, max, status, description, average_time, guarantee, start_time, speed, margin, id]
        );
        await clearCache('services:*');
        res.json({ message: 'Service updated successfully' });
    } catch (error) {
        logger.error('Error updating service:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


export const bulkUpdateMargin = async (req: Request, res: Response) => {
    const { ids, margin } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'IDs array is required' });
    }
    try {
        await query(
            'UPDATE services SET margin = $1 WHERE id = ANY($2)',
            [margin, ids]
        );
        await clearCache('services:*');
        res.json({ message: `Bulk margin updated for ${ids.length} services` });
    } catch (error) {
        logger.error('Error in bulk update margin:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


export const getCategories = async (req: Request, res: Response) => {
    const cacheKey = 'services:categories';
    try {
        const cached = await getCachedData(cacheKey);
        if (cached) return res.json(cached);

        const queryStr = `
            SELECT 
                COALESCE(s.display_category, s.category) as category,
                COUNT(s.id)::int as total_services,
                COUNT(CASE WHEN s.status = 'active' THEN 1 END)::int as active_services,
                STRING_AGG(DISTINCT p.name, ', ') as providers,
                COALESCE(cc.sort_order, 0) as sort_order
            FROM services s
            INNER JOIN providers p ON s.provider_id = p.id
            LEFT JOIN category_configs cc ON COALESCE(s.display_category, s.category) = cc.name
            WHERE s.category IS NOT NULL 
                AND p.status = 'active'
            GROUP BY COALESCE(s.display_category, s.category), cc.sort_order
            ORDER BY COALESCE(cc.sort_order, 0) ASC, (CASE WHEN COALESCE(s.display_category, s.category) LIKE \'%⭐%\' THEN 0 ELSE 1 END) ASC, category ASC
        `;
        const result = await query(queryStr);
        await setCachedData(cacheKey, result.rows, 300); // 5 mins

        // Prevent browser caching
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        res.json(result.rows);
    } catch (error) {
        logger.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


export const toggleCategoryStatus = async (req: Request, res: Response) => {
    const { category, status } = req.body;
    try {
        await query('UPDATE services SET status = $1 WHERE category = $2', [status, category]);
        await clearCache('services:*');
        res.json({ message: 'Category status updated successfully' });
    } catch (error) {
        logger.error('Error updating category status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


export const renameCategory = async (req: Request, res: Response) => {
    const { oldName, newName } = req.body;
    try {
        await query('UPDATE services SET category = $1 WHERE category = $2', [newName, oldName]);
        await clearCache('services:*');
        res.json({ message: 'Category renamed successfully' });
    } catch (error) {
        logger.error('Error renaming category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


export const toggleServiceStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await query('UPDATE services SET status = $1 WHERE id = $2', [status, id]);
        await clearCache('services:*');
        res.json({ message: 'Service status updated successfully' });
    } catch (error) {
        logger.error('Error updating service status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


export const deleteService = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await query('DELETE FROM services WHERE id = $1', [id]);
        await clearCache('services:*');
        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        logger.error('Error deleting service:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getServiceById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const cacheKey = `service:${id}`;
    try {
        const cached = await getCachedData(cacheKey);
        if (cached) return res.json(cached);

        const result = await query('SELECT * FROM services WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Service not found' });
        }

        await setCachedData(cacheKey, result.rows[0], 3600); // 1 hour
        res.json(result.rows[0]);
    } catch (error) {
        logger.error('Error fetching service:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateCategorySortOrder = async (req: Request, res: Response) => {
    const { category, sort_order } = req.body;
    try {
        await query(
            `INSERT INTO category_configs (name, sort_order) 
             VALUES ($1, $2) 
             ON CONFLICT (name) DO UPDATE SET sort_order = EXCLUDED.sort_order`,
            [category, sort_order]
        );
        await clearCache('services:*');
        res.json({ message: 'Category sort order updated successfully' });
    } catch (error) {
        logger.error('Error updating category sort order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
