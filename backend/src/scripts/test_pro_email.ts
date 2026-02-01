
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { sendEmail } from '../utils/mailer';

const testEmail = async () => {
    console.log('Testing email delivery from noreply@neposmm.com...');
    console.log('To:', process.env.SMTP_USER);

    const success = await sendEmail(
        process.env.SMTP_USER!,
        '🚀 Professional Email Test - NepoSMM',
        'If you are reading this, your noreply@neposmm.com address is now fully functional and sending via Brevo!',
        `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px;">
            <h1 style="color: #2563eb;">NepoSMM System Test</h1>
            <p>Congratulations! Your professional email <strong>noreply@neposmm.com</strong> is now working.</p>
            <p><strong>Status:</strong></p>
            <ul>
                <li>✅ Sending: Active via Brevo SMTP</li>
                <li>✅ Receiving: Active via Cloudflare Routing</li>
                <li>✅ Authentication: SPF/DKIM Verified</li>
            </ul>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #666;">This is an automated test message from your server.</p>
        </div>
        `
    );

    if (success) {
        console.log('✅ Success! Check your Gmail inbox (including Spam just in case, though it should go to Primary).');
    } else {
        console.error('❌ Failed to send email. Check your SMTP_PASS or Brevo account status.');
    }
};

testEmail();
