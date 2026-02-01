
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../../.env') });

const debugEmail = async () => {
    console.log('--- SMTP DEBUG START ---');
    console.log('Host:', process.env.SMTP_HOST);
    console.log('Port:', process.env.SMTP_PORT);
    console.log('User:', process.env.SMTP_USER);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // TLS
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        debug: true, // Show debug output
        logger: true // Log to console
    });

    try {
        console.log('Attempting to send test email...');
        await transporter.sendMail({
            from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
            to: 'suprajshr@gmail.com',
            subject: 'Debug Test',
            text: 'Testing SMTP connection precision.'
        });
        console.log('✅ Sent successfully!');
    } catch (error: any) {
        console.error('❌ SMTP ERROR:', error.message);
        if (error.response) console.error('Server Response:', error.response);
    } finally {
        process.exit();
    }
};

debugEmail();
