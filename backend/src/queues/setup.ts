import { Queue } from 'bullmq';
import { bullMqConnection } from '../config/redis';

export const notificationQueue = new Queue('notification', {
    connection: bullMqConnection as any,
});

export const orderQueue = new Queue('order-processing', {
    connection: bullMqConnection as any,
});

export const providerSyncQueue = new Queue('provider-sync', {
    connection: bullMqConnection as any,
});
