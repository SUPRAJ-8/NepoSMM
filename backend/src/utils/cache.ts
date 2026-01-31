import redis from '../config/redis';
import logger from './logger';

export const getCachedData = async <T>(key: string): Promise<T | null> => {
    try {
        const data = await redis.get(key);
        if (data) {
            logger.info(`Cache HIT for key: ${key}`);
            return JSON.parse(data) as T;
        }
        logger.info(`Cache MISS for key: ${key}`);
    } catch (error: any) {
        // Handle connection errors (including AggregateError from Node 18+)
        const isConnectionError =
            error.code === 'ECONNREFUSED' ||
            error.message?.includes('Connection is closed') ||
            error.name === 'MaxRetriesPerRequestError' ||
            (error instanceof Error && error.name === 'AggregateError') ||
            (Array.isArray(error.errors) && error.errors.some((e: any) => e.code === 'ECONNREFUSED'));

        if (isConnectionError) {
            // Only log warning if it's not a retry error to avoid flooding
            if (error.name !== 'MaxRetriesPerRequestError') {
                logger.warn(`Redis unavailable for key ${key}, falling back to database`);
            }
            return null;
        }
        logger.error(`Redis get error for key ${key}:`, error);
    }
    return null;
};

export const setCachedData = async (key: string, data: any, ttlSeconds: number = 3600): Promise<void> => {
    try {
        await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
        logger.info(`Cache SET for key: ${key} (TTL: ${ttlSeconds}s)`);
    } catch (error: any) {
        const isConnectionError =
            error.code === 'ECONNREFUSED' ||
            error.message?.includes('Connection is closed') ||
            error.name === 'MaxRetriesPerRequestError' ||
            (error instanceof Error && error.name === 'AggregateError') ||
            (Array.isArray(error.errors) && error.errors.some((e: any) => e.code === 'ECONNREFUSED'));

        if (isConnectionError) {
            if (error.name !== 'MaxRetriesPerRequestError') {
                logger.warn(`Redis unavailable, skipping cache set for key ${key}`);
            }
            return;
        }
        logger.error(`Redis set error for key ${key}:`, error);
    }
};

export const clearCache = async (pattern: string): Promise<void> => {
    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(...keys);
            logger.info(`Cleared ${keys.length} cache keys for pattern: ${pattern}`);
        } else {
            logger.info(`No cache keys found for pattern: ${pattern}`);
        }
    } catch (error: any) {
        const isConnectionError =
            error.code === 'ECONNREFUSED' ||
            error.message?.includes('Connection is closed') ||
            (error instanceof Error && error.name === 'AggregateError') ||
            (Array.isArray(error.errors) && error.errors.some((e: any) => e.code === 'ECONNREFUSED'));

        if (isConnectionError) {
            logger.warn(`Redis unavailable, skipping cache clear for pattern ${pattern}`);
            return;
        }
        logger.error(`Redis clear cache error for pattern ${pattern}:`, error);
    }
};
