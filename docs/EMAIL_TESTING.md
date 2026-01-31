# Email Template Testing

## Overview
The Email Template Testing feature allows administrators to preview and test email templates without triggering actual user events (like sign-ups, password resets, etc.).

## Features

### 1. **Template Preview**
- View all available email templates
- Preview templates with custom sample data
- See the rendered HTML in real-time

### 2. **Test Email Sending**
- Send test emails to any email address
- Verify email delivery and formatting
- Test with different data scenarios

### 3. **Available Templates**
- **Welcome Email**: Sent to new users after registration
- **Password Reset**: Sent when users request password reset
- **Order Confirmation**: Sent after successful order placement

## How to Use

### Access the Email Testing Page
1. Log in to the admin panel
2. Navigate to **System** → **Email Testing** in the sidebar
3. You'll see the email template testing interface

### Preview a Template
1. Select a template from the left sidebar
2. Fill in the template data fields (or use default values)
3. Click **Preview** to see the rendered email
4. The preview will show both the subject line and HTML content

### Send a Test Email
1. Select a template
2. Fill in the template data
3. Enter your test email address
4. Click **Send Test** to receive the email
5. Check your inbox for the test email (subject will be prefixed with [TEST])

## API Endpoints

### Backend Routes
All routes require admin authentication.

#### `GET /api/email-test/templates`
Returns list of all available email templates.

**Response:**
```json
[
  {
    "id": "welcome",
    "name": "Welcome Email",
    "description": "Sent to new users after registration",
    "requiredFields": ["username"]
  }
]
```

#### `POST /api/email-test/preview`
Preview an email template with sample data.

**Request:**
```json
{
  "templateId": "welcome",
  "data": {
    "username": "John Doe"
  }
}
```

**Response:**
```json
{
  "subject": "Welcome to Nepo SMM!",
  "html": "<div>...</div>"
}
```

#### `POST /api/email-test/send-test`
Send a test email.

**Request:**
```json
{
  "templateId": "welcome",
  "data": {
    "username": "John Doe"
  },
  "testEmail": "test@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully"
}
```

## Adding New Email Templates

To add a new email template:

1. **Create the template function** in `backend/src/utils/emailTemplates.ts`:
```typescript
export const getNewTemplate = (param1: string, param2: string) => {
  return `
    <div style="font-family: Arial, sans-serif;">
      <h2>Your Template</h2>
      <p>${param1}</p>
      <p>${param2}</p>
    </div>
  `;
};
```

2. **Add to the controller** in `backend/src/controllers/emailTestController.ts`:
   - Add to `getEmailTemplates` array
   - Add case in `previewEmailTemplate` switch
   - Add case in `sendTestEmail` switch

3. The new template will automatically appear in the admin interface!

## Email Configuration

Make sure your `.env` file has the correct SMTP settings:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=Nepo SMM
SMTP_FROM_EMAIL=noreply@neposmm.com
```

## Troubleshooting

### "Failed to send test email"
- Check your SMTP configuration in `.env`
- Verify SMTP credentials are correct
- Check if your email provider allows SMTP access
- For Gmail, you may need to use an App Password

### Template not showing
- Ensure the template is added to all three places in the controller
- Check browser console for errors
- Verify admin authentication is working

## Development Tips

1. **Use default values**: The system provides sensible defaults for all fields
2. **Test with real data**: Try different scenarios to ensure templates work correctly
3. **Check spam folder**: Test emails might end up in spam
4. **Use [TEST] prefix**: All test emails are prefixed with [TEST] to avoid confusion

## Future Enhancements

Potential improvements:
- Email template editor (WYSIWYG)
- Template versioning
- A/B testing support
- Email analytics
- Custom template variables
- Template library/marketplace
