const LOGO_URL = 'https://neposmm.com/logo.png';

export const getSignUpEmailTemplate = (username: string, email: string) => {
    const primaryColor = '#8b5cf6'; // Violet 500
    const secondaryColor = '#6366f1'; // Indigo 500
    const textColor = '#1e293b'; // Slate 800
    const lightTextColor = '#64748b'; // Slate 500
    const bgColor = '#f8fafc'; // Slate 50
    const cardBg = '#ffffff';

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Nepo SMM</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0; padding: 0; background-color: ${bgColor}; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: ${bgColor};">
            <tr>
                <td align="center" style="padding: 40px 20px;">
                    <!-- Main Card -->
                    <table role="presentation" style="max-width: 500px; width: 100%; background-color: ${cardBg}; border-radius: 32px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.08); border: 1px solid #f1f5f9;">
                        
                        <!-- Logo & Header -->
                        <tr>
                            <td style="padding: 40px 40px 20px; text-align: center;">
                                <div style="margin-bottom: 24px;">
                                    <img src="${LOGO_URL}" alt="NepoSMM Logo" width="60" height="60" style="display: inline-block; border-radius: 16px;">
                                </div>
                                <h1 style="margin: 0; color: ${textColor}; font-size: 32px; font-weight: 800; letter-spacing: -1px; line-height: 1.2;">Welcome to <a href="${process.env.FRONTEND_URL || 'https://neposmm.com'}" style="color: ${textColor}; text-decoration: none;">Nepo SMM</a>! 🎊</h1>
                                <p style="margin: 8px 0 0; color: ${lightTextColor}; font-size: 16px; font-weight: 500;">Your account is ready to go.</p>
                            </td>
                        </tr>

                        <!-- Greeting -->
                        <tr>
                            <td style="padding: 0 40px 30px;">
                                <h2 style="margin: 0 0 16px; color: ${textColor}; font-size: 24px; font-weight: 700;">Hi @${username}! 👋</h2>
                                <p style="margin: 0; color: ${lightTextColor}; font-size: 15px; line-height: 1.6; font-weight: 500;">
                                    We're thrilled to have you join the <a href="${process.env.FRONTEND_URL || 'https://neposmm.com'}" style="color: ${primaryColor}; text-decoration: none; font-weight: 700;">Nepo SMM</a> community! Your account has been successfully created and you're all set to start boosting your social media presence.
                                </p>
                            </td>
                        </tr>

                        <!-- Email Info Box -->
                        <tr>
                            <td style="padding: 0 40px 40px;">
                                <div style="background: ${cardBg}; border: 2px solid #e2e8f0; border-left: 4px solid ${primaryColor}; border-radius: 20px; padding: 20px 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
                                    <p style="margin: 0 0 4px; color: #94a3b8; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Email Address</p>
                                    <p style="margin: 0; color: ${textColor}; font-size: 18px; font-weight: 700;">${email}</p>
                                </div>
                            </td>
                        </tr>

                        <!-- Section Title -->
                        <tr>
                            <td style="padding: 0 40px 20px;">
                                <p style="margin: 0; color: #94a3b8; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px;">What you can do now:</p>
                            </td>
                        </tr>

                        <!-- Features Grid -->
                        <tr>
                            <td style="padding: 0 32px 30px;">
                                <table role="presentation" style="width: 100%; border-collapse: separate; border-spacing: 8px;">
                                    <tr>
                                        <!-- Place Orders -->
                                        <td width="50%" style="background: #ffffff; border: 1px solid #f1f5f9; border-radius: 20px; padding: 20px; text-align: left; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                                            <div style="background: rgba(139, 92, 246, 0.1); width: 40px; height: 40px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
                                                <span style="font-size: 20px;">🚀</span>
                                            </div>
                                            <p style="margin: 0; color: ${textColor}; font-size: 14px; font-weight: 700;">Place Orders</p>
                                            <p style="margin: 2px 0 0; color: ${lightTextColor}; font-size: 11px; font-weight: 500;">Boost instantly</p>
                                        </td>
                                        <!-- Add Funds -->
                                        <td width="50%" style="background: #ffffff; border: 1px solid #f1f5f9; border-radius: 20px; padding: 20px; text-align: left; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                                            <div style="background: rgba(245, 158, 11, 0.1); width: 40px; height: 40px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
                                                <span style="font-size: 20px;">💰</span>
                                            </div>
                                            <p style="margin: 0; color: ${textColor}; font-size: 14px; font-weight: 700;">Add Funds</p>
                                            <p style="margin: 2px 0 0; color: ${lightTextColor}; font-size: 11px; font-weight: 500;">Multiple methods</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <!-- Track Progress -->
                                        <td width="50%" style="background: #ffffff; border: 1px solid #f1f5f9; border-radius: 20px; padding: 20px; text-align: left; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                                            <div style="background: rgba(59, 130, 246, 0.1); width: 40px; height: 40px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
                                                <span style="font-size: 20px;">📈</span>
                                            </div>
                                            <p style="margin: 0; color: ${textColor}; font-size: 14px; font-weight: 700;">Track Progress</p>
                                            <p style="margin: 2px 0 0; color: ${lightTextColor}; font-size: 11px; font-weight: 500;">Real-time updates</p>
                                        </td>
                                        <!-- Premium Services -->
                                        <td width="50%" style="background: #ffffff; border: 1px solid #f1f5f9; border-radius: 20px; padding: 20px; text-align: left; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                                            <div style="background: rgba(139, 92, 246, 0.1); width: 40px; height: 40px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
                                                <span style="font-size: 20px;">⭐</span>
                                            </div>
                                            <p style="margin: 0; color: ${textColor}; font-size: 14px; font-weight: 700;">Pro Services</p>
                                            <p style="margin: 2px 0 0; color: ${lightTextColor}; font-size: 11px; font-weight: 500;">100+ Pro services</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- CTA Button -->
                        <tr>
                            <td style="padding: 0 40px 40px;">
                                <a href="${process.env.FRONTEND_URL || 'https://neposmm.com'}/login" style="display: block; background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor}); color: #ffffff; text-decoration: none; padding: 20px; border-radius: 20px; text-align: center; font-weight: 800; font-size: 18px; box-shadow: 0 10px 25px rgba(139, 92, 246, 0.3); transition: all 0.3s ease;">
                                    Get Started Now &rarr;
                                </a>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

// Keep the old function for backward compatibility
export const getWelcomeEmailTemplate = (username: string) => {
    return getSignUpEmailTemplate(username, 'user@example.com');
};

export const getPasswordResetTemplate = (resetLink: string) => {
    const primaryColor = '#8b5cf6';
    const textColor = '#1e293b';
    const lightTextColor = '#64748b';
    const bgColor = '#f8fafc';
    const cardBg = '#ffffff';

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0; padding: 0; background-color: ${bgColor}; font-family: 'Inter', sans-serif;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: ${bgColor};">
            <tr>
                <td align="center" style="padding: 40px 20px;">
                    <table role="presentation" style="max-width: 500px; width: 100%; background-color: ${cardBg}; border-radius: 32px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.08); border: 1px solid #f1f5f9;">
                        <tr>
                            <td style="padding: 40px; text-align: center;">
                                <div style="margin-bottom: 24px;">
                                    <img src="${LOGO_URL}" alt="NepoSMM Logo" width="50" height="50" style="display: inline-block;">
                                </div>
                                <div style="display: inline-block; background: #fef2f2; padding: 20px; border-radius: 20px; margin-bottom: 24px;">
                                    <span style="font-size: 32px;">🔐</span>
                                </div>
                                <h1 style="margin: 0; color: ${textColor}; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Reset Your Password</h1>
                                <p style="margin: 12px 0 0; color: ${lightTextColor}; font-size: 16px; line-height: 1.6; font-weight: 500;">
                                    We received a request to reset your password. If you didn't make this request, you can safely ignore this email.
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 0 40px 40px;">
                                <a href="${resetLink}" style="display: block; background: ${primaryColor}; color: #ffffff; text-decoration: none; padding: 18px; border-radius: 16px; text-align: center; font-weight: 700; font-size: 16px; box-shadow: 0 10px 15px -3px rgba(139, 92, 246, 0.3);">
                                    Reset Password
                                </a>
                                <p style="margin: 24px 0 0; color: #94a3b8; font-size: 12px; text-align: center;">
                                    The link will expire in 1 hour.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

export const getOrderConfirmationTemplate = (orderId: string, serviceName: string, amount: string) => {
    const primaryColor = '#10b981'; // Emerald 500 for success
    const textColor = '#1e293b';
    const lightTextColor = '#64748b';
    const bgColor = '#f8fafc';
    const cardBg = '#ffffff';

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0; padding: 0; background-color: ${bgColor}; font-family: 'Inter', sans-serif;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: ${bgColor};">
            <tr>
                <td align="center" style="padding: 40px 20px;">
                    <table role="presentation" style="max-width: 500px; width: 100%; background-color: ${cardBg}; border-radius: 32px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.08); border: 1px solid #f1f5f9;">
                        <tr>
                            <td style="padding: 40px; text-align: center;">
                                <div style="display: inline-block; background: #ecfdf5; padding: 20px; border-radius: 20px; margin-bottom: 24px;">
                                    <span style="font-size: 32px;">✅</span>
                                </div>
                                <h1 style="margin: 0; color: ${textColor}; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Order Confirmed!</h1>
                                <p style="margin: 8px 0 0; color: ${lightTextColor}; font-size: 16px; font-weight: 500;">Order #${orderId} is being processed.</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 0 40px 30px;">
                                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; padding: 24px;">
                                    <table role="presentation" style="width: 100%;">
                                        <tr>
                                            <td style="padding-bottom: 12px;">
                                                <p style="margin: 0; color: #94a3b8; font-size: 11px; font-weight: 800; text-transform: uppercase;">Service</p>
                                                <p style="margin: 4px 0 0; color: ${textColor}; font-size: 15px; font-weight: 600;">${serviceName}</p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <p style="margin: 0; color: #94a3b8; font-size: 11px; font-weight: 800; text-transform: uppercase;">Total Amount</p>
                                                <p style="margin: 4px 0 0; color: ${primaryColor}; font-size: 20px; font-weight: 800;">${amount}</p>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 0 40px 40px; text-align: center;">
                                <p style="margin: 0; color: ${lightTextColor}; font-size: 14px; font-weight: 500;">
                                    Thank you for your order! You can track the status in your dashboard.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};


export const getFundsAddedTemplate = (username: string, amount: string, newBalance: string) => {
    const primaryColor = '#10b981'; // Emerald 500
    const textColor = '#1e293b';
    const lightTextColor = '#64748b';
    const bgColor = '#f8fafc';
    const cardBg = '#ffffff';

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Funds Added Successfully</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0; padding: 0; background-color: ${bgColor}; font-family: 'Inter', sans-serif;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: ${bgColor};">
            <tr>
                <td align="center" style="padding: 40px 20px;">
                    <table role="presentation" style="max-width: 500px; width: 100%; background-color: ${cardBg}; border-radius: 32px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.08); border: 1px solid #f1f5f9;">
                        <tr>
                            <td style="padding: 40px; text-align: center;">
                                <div style="margin-bottom: 24px;">
                                    <img src="${LOGO_URL}" alt="NepoSMM Logo" width="50" height="50" style="display: inline-block;">
                                </div>
                                <div style="display: inline-block; background: #ecfdf5; padding: 20px; border-radius: 20px; margin-bottom: 24px;">
                                    <span style="font-size: 32px;">💰</span>
                                </div>
                                <h1 style="margin: 0; color: ${textColor}; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Funds Added!</h1>
                                <p style="margin: 8px 0 0; color: ${lightTextColor}; font-size: 16px; font-weight: 500;">Hi @${username}, your balance has been updated.</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 0 40px 30px;">
                                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; padding: 24px;">
                                    <table role="presentation" style="width: 100%;">
                                        <tr>
                                            <td style="padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
                                                <p style="margin: 0; color: #94a3b8; font-size: 11px; font-weight: 800; text-transform: uppercase;">Amount Added</p>
                                                <p style="margin: 4px 0 0; color: ${primaryColor}; font-size: 24px; font-weight: 800;">${amount}</p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding-top: 12px;">
                                                <p style="margin: 0; color: #94a3b8; font-size: 11px; font-weight: 800; text-transform: uppercase;">New Total Balance</p>
                                                <p style="margin: 4px 0 0; color: ${textColor}; font-size: 18px; font-weight: 700;">${newBalance}</p>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 0 40px 40px;">
                                <a href="${process.env.FRONTEND_URL || 'https://neposmm.com'}/dashboard" style="display: block; background: ${textColor}; color: #ffffff; text-decoration: none; padding: 18px; border-radius: 16px; text-align: center; font-weight: 700; font-size: 16px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
                                    Go to Dashboard
                                </a>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

export const getTwoFactorOTPTemplate = (otp: string) => {
    const primaryColor = '#3b82f6'; // Blue 500
    const textColor = '#1e293b';
    const lightTextColor = '#64748b';
    const bgColor = '#f8fafc';
    const cardBg = '#ffffff';

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Verification Code</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0; padding: 0; background-color: ${bgColor}; font-family: 'Inter', sans-serif;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: ${bgColor};">
            <tr>
                <td align="center" style="padding: 40px 20px;">
                    <table role="presentation" style="max-width: 500px; width: 100%; background-color: ${cardBg}; border-radius: 32px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.08); border: 1px solid #f1f5f9;">
                        <tr>
                            <td style="padding: 40px; text-align: center;">
                                <div style="margin-bottom: 24px;">
                                    <img src="${LOGO_URL}" alt="NepoSMM Logo" width="50" height="50" style="display: inline-block;">
                                </div>
                                <div style="display: inline-block; background: #eff6ff; padding: 20px; border-radius: 20px; margin-bottom: 24px;">
                                    <span style="font-size: 32px;">🛡️</span>
                                </div>
                                <h1 style="margin: 0; color: ${textColor}; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Verification Code</h1>
                                <p style="margin: 12px 0 0; color: ${lightTextColor}; font-size: 16px; line-height: 1.6; font-weight: 500;">
                                    Please use the following code to complete your sign-in request.
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 0 40px 40px;">
                                <div style="background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 20px; padding: 30px; text-align: center;">
                                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 42px; font-weight: 800; letter-spacing: 12px; color: ${primaryColor}; text-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);">
                                        ${otp}
                                    </span>
                                </div>
                                <p style="margin: 24px 0 0; color: #94a3b8; font-size: 13px; text-align: center; font-weight: 500;">
                                    This code will expire in <span style="color: ${textColor}; font-weight: 700;">10 minutes</span>.
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 0 40px 40px; text-align: center; border-top: 1px solid #f1f5f9;">
                                <p style="margin: 20px 0 0; color: #cbd5e1; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                                    If you didn't request this code, please secure your account immediately.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};



