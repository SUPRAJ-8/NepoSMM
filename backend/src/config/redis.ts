import Redis from 'ioredis';
import logger from '../utils/logger';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
    lazyConnect: true,
    retryStrategy(times) {
        // Exponential backoff, max 5 seconds
        const delay = Math.min(times * 100, 5000);
        return delay;
    },
});

redis.on('connect', () => {
    logger.info('Connected to Redis');
});

let lastRedisErrorLog = 0;
const ERROR_LOG_THROTTLE = 60000; // 1 minute

redis.on('error', (err: any) => {
    const isConnError = err.code === 'ECONNREFUSED' || err.name === 'AggregateError' || (err.errors && err.errors.some((e: any) => e.code === 'ECONNREFUSED'));
    const now = Date.now();

    if (isConnError) {
        if (now - lastRedisErrorLog > ERROR_LOG_THROTTLE) {
            logger.warn('Redis is currently unreachable. Some background features will be unavailable.');
            lastRedisErrorLog = now;
        }
    } else {
        logger.error('Redis encountered an error:', err);
    }
});

export const bullMqConnection = redis;
export default redis;
