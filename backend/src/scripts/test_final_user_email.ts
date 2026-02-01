
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { sendEmail } from '../utils/mailer';

const testRealEmail = async () => {
    const target = 'suprajshr@gmail.com';
    console.log(`Sending a REAL test to: ${target}`);

    const success = await sendEmail(
        target,
        '🛠️ FINAL DNS SETUP TEST - NepoSMM',
        'If you see this in your inbox (or Spam), our connection to Brevo is perfect. Now we just need to fix the DNS records to make it go to Primary!',
        `
        <div style="font-family: sans-serif; padding: 30px; background-color: #f9fafb; border-radius: 20px;">
            <h2 style="color: #2563eb;">Final Verification</h2>
            <p>I am testing your main support email: <strong>suprajshr@gmail.com</strong></p>
            <div style="background: white; padding: 20px; border-radius: 15px; border: 1px solid #e5e7eb;">
                <p><strong>Next Action:</strong> You need to point your domain nameservers to Cloudflare so the email routing activates.</p>
            </div>
        </div>
        `
    );

    if (success) {
        console.log('✅ Test sent! Please check suprajshr@gmail.com (Check Spam too!)');
    } else {
        console.error('❌ Failed to send.');
    }
};

testRealEmail();
