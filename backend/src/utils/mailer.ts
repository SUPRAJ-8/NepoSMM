import nodemailer from 'nodemailer';
import logger from './logger';

const getTransporter = () => {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return null;
    }

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
    const transporter = getTransporter();

    if (!transporter) {
        logger.warn('Email configuration missing or incomplete. Skipping email sending.');
        return false;
    }

    try {
        const info = await transporter.sendMail({
            from: `"${process.env.SMTP_FROM_NAME || 'Nepo SMM'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
            to,
            subject,
            text,
            html: html || text,
        });

        logger.info(`Email sent: ${info.messageId} to ${to}`);
        return true;
    } catch (error) {
        logger.error(`Error sending email to ${to}:`, error);
        return false;
    }
};
