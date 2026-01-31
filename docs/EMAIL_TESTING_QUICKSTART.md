# Email Template Testing - Quick Start Guide

## 🎯 What Problem Does This Solve?

Previously, to test email templates (like sign-up emails, password reset emails, etc.), you had to:
- Actually sign up with a new account
- Trigger password resets
- Place real orders
- Wait for emails to arrive
- Repeat the process for every change

**Now you can:**
- Preview all email templates instantly
- Test with custom data
- Send test emails to yourself
- No need to trigger actual events!

## 🚀 How to Access

1. **Login to Admin Panel**
2. **Navigate to**: System → Email Testing (in the sidebar)
3. **Start Testing!**

## 📧 Available Templates

### 1. Welcome Email
- Sent when new users register
- Fields: Username

### 2. Password Reset
- Sent when users request password reset
- Fields: Reset Link

### 3. Order Confirmation
- Sent after successful order placement
- Fields: Order ID, Service Name, Amount

## 💡 Quick Usage

### Preview a Template
1. Click on a template from the left sidebar
2. The form will auto-fill with sample data
3. Modify the data if needed
4. Click **Preview** button
5. See the rendered email below!

### Send Test Email
1. Select a template
2. Enter your email address in "Test Email Address" field
3. Click **Send Test** button
4. Check your inbox (might be in spam folder)
5. Email subject will have [TEST] prefix

## 🎨 Features

✅ **Instant Preview** - See exactly how emails will look  
✅ **Custom Data** - Test with different scenarios  
✅ **Real Email Testing** - Send actual test emails  
✅ **No Side Effects** - Doesn't create real users/orders  
✅ **Beautiful UI** - Modern, intuitive interface  
✅ **Admin Only** - Secure, authenticated access  

## 🔧 Technical Details

### Backend
- **Controller**: `backend/src/controllers/emailTestController.ts`
- **Routes**: `backend/src/routes/emailTestRoutes.ts`
- **Templates**: `backend/src/utils/emailTemplates.ts`
- **API Base**: `/api/email-test`

### Frontend
- **Page**: `frontend/src/app/admin/email-testing/page.tsx`
- **Sidebar Link**: Added to AdminSidebar under "System"

### API Endpoints
- `GET /api/email-test/templates` - List all templates
- `POST /api/email-test/preview` - Preview with data
- `POST /api/email-test/send-test` - Send test email

## 📝 Example Use Cases

### Scenario 1: Testing Welcome Email
```
1. Select "Welcome Email"
2. Change username to "Sarah Johnson"
3. Click Preview
4. Verify the greeting looks correct
5. Send test to your email
6. Confirm it arrives properly
```

### Scenario 2: Testing Password Reset Link
```
1. Select "Password Reset"
2. Enter a custom reset link
3. Preview the email
4. Verify the button/link works
5. Send test email
6. Click the link to test
```

### Scenario 3: Testing Order Confirmation
```
1. Select "Order Confirmation"
2. Enter order details (ID, service, amount)
3. Preview to check formatting
4. Send test email
5. Verify all details display correctly
```

## ⚙️ Email Configuration

Make sure your `.env` has SMTP settings:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=Nepo SMM
SMTP_FROM_EMAIL=noreply@neposmm.com
```

## 🐛 Troubleshooting

**Email not sending?**
- Check SMTP configuration in `.env`
- Verify email credentials
- For Gmail, use App Password (not regular password)

**Template not showing?**
- Refresh the page
- Check browser console for errors
- Verify you're logged in as admin

**Preview not working?**
- Make sure all required fields are filled
- Check network tab for API errors

## 🎉 Benefits

1. **Save Time** - No more creating fake accounts
2. **Test Faster** - Instant feedback on changes
3. **Better Quality** - Test multiple scenarios easily
4. **No Cleanup** - No fake data in your database
5. **Professional** - Impress clients with thorough testing

## 📚 For Developers

To add a new email template:

1. Create template function in `emailTemplates.ts`
2. Add to controller's template list
3. Add preview case
4. Add send test case
5. Done! It appears automatically in UI

See `docs/EMAIL_TESTING.md` for detailed developer guide.

---

**Enjoy hassle-free email testing! 🚀**
