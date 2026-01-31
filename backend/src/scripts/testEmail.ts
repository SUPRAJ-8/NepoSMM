import dotenv from 'dotenv';
import path from 'path';

// Load env vars explicitly from the root backend .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { sendEmail } from '../utils/mailer';

const main = async () => {
    const emailTo = process.argv[2];
    if (!emailTo) {
        console.error('Please provide an email address as an argument.');
        console.log('Usage: npx ts-node src/scripts/testEmail.ts your_email@example.com');
        process.exit(1);
    }

    console.log(`Reading config from: ${path.resolve(__dirname, '../../.env')}`);
    console.log('SMTP Config:', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER ? '******' : 'MISSING',
    });

    console.log(`Attempting to send email to ${emailTo}...`);
    const success = await sendEmail(emailTo, 'Test Email from Nepo SMM', 'This is a test email to verify your SMTP configuration.');

    if (success) {
        console.log('Email sent successfully!');
    } else {
        console.error('Failed to send email. Check logs for details.');
    }
};

main();
