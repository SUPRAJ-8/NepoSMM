import { query } from '../config/db';
import dotenv from 'dotenv';
dotenv.config();

async function addRejectionReason() {
    try {
        await query('ALTER TABLE payout_requests ADD COLUMN IF NOT EXISTS rejection_reason TEXT;');
        console.log('Added rejection_reason column to payout_requests.');
    } catch (err) {
        console.error('Error in migration:', err);
    } finally {
        process.exit();
    }
}

addRejectionReason();
