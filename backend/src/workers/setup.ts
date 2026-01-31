import { Worker } from 'bullmq';
import { bullMqConnection } from '../config/redis';
import logger from '../utils/logger';
import { syncAllActiveProviders } from '../controllers/providerController';

export const setupWorkers = () => {
    const notificationWorker = new Worker('notification', async job => {
        logger.info(`Processing notification for job ${job.id}`);
        // Simulate work
        await new Promise(resolve => setTimeout(resolve, 1000));
        logger.info(`Notification sent for job ${job.id}`);
    }, {
        connection: bullMqConnection as any,
    });

    notificationWorker.on('error', err => {
        logger.error('Notification worker error:', err);
    });

    const orderWorker = new Worker('order-processing', async job => {
        logger.info(`Processing order ${job.id}`);
        // Simulate work
        await new Promise(resolve => setTimeout(resolve, 1000));
        logger.info(`Order ${job.id} processed`);
    }, {
        connection: bullMqConnection as any,
    });

    orderWorker.on('error', err => {
        logger.error('Order worker error:', err);
    });

    const providerSyncWorker = new Worker('provider-sync', async job => {
        if (job.name === 'sync-all-active') {
            await syncAllActiveProviders();
        }
    }, {
        connection: bullMqConnection as any,
    });

    providerSyncWorker.on('error', err => {
        logger.error('Provider sync worker error:', err);
    });

    logger.info('Workers started');
};
