import { clearCache } from '../utils/cache';

async function clearServicesCache() {
    try {
        console.log('Clearing services cache...');
        await clearCache('services:*');
        console.log('Cache cleared successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

clearServicesCache();
