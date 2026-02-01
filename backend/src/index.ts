console.log('--- RESTARTING NEPO SMM BACKEND ---');
import express from 'express'; // Force reload
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { setupWorkers } from './workers/setup';
import { providerSyncQueue } from './queues/setup';
import userRoutes from './routes/userRoutes';
import providerRoutes from './routes/providerRoutes';
import serviceRoutes from './routes/serviceRoutes';
import currencyRoutes from './routes/currencyRoutes';
import paymentMethodRoutes from './routes/paymentMethodRoutes';
import uploadRoutes from './routes/uploadRoutes';
import orderRoutes from './routes/orderRoutes';
import emailTestRoutes from './routes/emailTestRoutes';
import settingsRoutes from './routes/settingsRoutes';
import affiliateRoutes from './routes/affiliateRoutes';
import ticketRoutes from './routes/ticketRoutes';
import logger from './utils/logger';
import { query } from './config/db';
import redis from './config/redis';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(express.json());

// Request logging
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));


app.get('/', (req, res) => {
    res.send('Nepo SMM API is running');
});

app.get('/health', async (req, res) => {
    try {
        await query('SELECT 1');
        res.json({ status: 'up', database: 'connected', timestamp: new Date() });
    } catch (error) {
        logger.error('Health check failed:', error);
        res.status(503).json({ status: 'down', database: 'disconnected', error: 'Database connection failed' });
    }
});


app.use('/api/users', userRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/currencies', currencyRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/email-test', emailTestRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/affiliates', affiliateRoutes);
app.use('/api/tickets', ticketRoutes);


import path from 'path';
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Start Server immediately so API is responsive even if Redis is down
app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});

// Prevent process crash from Redis connection failures or other async rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
});


redis.ping().then(() => {
    try {
        setupWorkers();

        // Schedule Auto Sync (Every 2 Hours)
        const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

        providerSyncQueue.add('sync-all-active', {}, {
            repeat: {
                every: TWO_HOURS_MS
            },
            removeOnComplete: true,
            removeOnFail: true
        }).then(() => {
            logger.info('[SCHEDULER] Auto-sync job scheduled for every 2 hours.');
        }).catch((err: any) => {
            logger.error('[SCHEDULER] Failed to schedule auto-sync job:', err);
        });
    } catch (error) {
        logger.warn('Failed to setup workers:', error);
    }
}).catch((err) => {
    logger.warn(`Redis connection failed. Background jobs and workers are disabled. Error: ${err.message}`);

    // Fallback: Use simple interval for Auto Sync if Redis is down
    const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
    logger.info('[SCHEDULER] Redis unavailable. Using fallback setInterval for Auto Sync (every 2 hours).');

    const runFallbackSync = async () => {
        try {
            logger.info('[FALLBACK SCHEDULER] Triggering Auto Sync...');
            const { syncAllActiveProviders } = await import('./controllers/providerController');
            await syncAllActiveProviders();
        } catch (error) {
            logger.error('[FALLBACK SCHEDULER] Auto Sync failed:', error);
        }
    };

    // Run once immediately on startup to ensure it works
    setTimeout(runFallbackSync, 10000); // 10s delay to let server settle

    setInterval(runFallbackSync, TWO_HOURS_MS);
});
