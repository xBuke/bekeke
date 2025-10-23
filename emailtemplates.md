# Email Templates Implementation Guide

## Overview
This guide explains how to implement the branded email template system for Uslugo, including forgot password functionality and consistent email branding across all user communications.

## 📧 What's Included

### Branded Email Template System
- **Consistent Design**: All emails use Uslugo branding (blue-600 colors, logo, professional layout)
- **Responsive**: Works on all devices and email clients
- **Professional**: Clean typography, proper spacing, branded buttons
- **Info Boxes**: Color-coded information boxes (success, warning, error, info)

### Email Templates Available
1. **Password Reset** - Forgot password instructions
2. **Welcome Client** - New client onboarding
3. **Welcome Provider** - New provider onboarding (pending verification)
4. **New Booking** - Service request notifications
5. **Booking Accepted** - Booking confirmation
6. **Booking Rejected** - Booking rejection with reason
7. **Provider Verified** - Provider verification success
8. **Provider Rejected** - Provider verification rejection
9. **Payment Success Client** - Payment confirmation for clients
10. **Payment Success Provider** - Payment notification for providers

## 🚀 Implementation Steps

### Step 1: Environment Setup

#### Required Environment Variables
Add these to your `.env.local`:
```env
# Email Configuration
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@resend.dev
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Get Resend API Key
1. Go to [https://resend.com](https://resend.com)
2. Create account or sign in
3. Go to API Keys
4. Click "Create API Key"
5. Copy the API key (starts with `re_...`)
6. Add to `.env.local` as `RESEND_API_KEY`

### Step 2: Supabase Configuration

#### Configure Supabase Dashboard
1. **Go to Supabase Dashboard → Authentication → Settings**

2. **Email Templates Section:**
   - ❌ **Disable**: "Enable email confirmations" (we use custom email flow)
   - ❌ **Disable**: "Enable email change confirmations"
   - ✅ **Keep enabled**: "Enable password resets" (we override with custom email)

3. **URL Configuration:**
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: Add these URLs:
     ```
     http://localhost:3000/reset-password
     https://uslugo.vercel.app/reset-password
     ```

### Step 3: Code Implementation

#### Files Created/Modified

**New Files:**
- `lib/email-template.ts` - Branded email template system
- `app/(auth)/forgot-password/page.tsx` - Forgot password form
- `app/(auth)/reset-password/page.tsx` - Reset password form
- `app/api/auth/forgot-password/route.ts` - Forgot password API
- `app/api/auth/validate-reset-token/route.ts` - Token validation API
- `app/api/auth/reset-password/route.ts` - Reset password API

**Modified Files:**
- `lib/email.ts` - Refactored all email templates with branding
- `app/(auth)/login/page.tsx` - Enabled forgot password link
- `ENV_SETUP.md` - Updated with configuration instructions

### Step 4: Testing the Implementation

#### Local Testing
1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Test forgot password flow:**
   - Go to `/login`
   - Click "Zaboravili ste lozinku?"
   - Enter email address
   - Check email for branded reset link
   - Click link and test password reset

3. **Test email templates:**
   - Check that all emails use Uslugo branding
   - Verify responsive design
   - Test all email types (booking, payment, etc.)

#### Production Testing
1. **Deploy to Vercel:**
   - Push changes to git
   - Vercel will auto-deploy

2. **Test on production:**
   - Visit [https://uslugo.vercel.app/](https://uslugo.vercel.app/)
   - Test forgot password flow
   - Verify emails are sent with proper branding

## 🎨 Email Template Features

### Visual Design
- **Primary Color**: `#2563eb` (blue-600)
- **Background**: `#f8fafc` (gray-50)
- **Text**: `#1e293b` (gray-800)
- **Buttons**: Blue-600 with white text, rounded corners
- **Logo**: "Uslugo" text in blue-600, bold, 24px

### Layout Structure
1. **Header**: Uslugo logo with blue gradient background
2. **Content**: Personalized greeting and main message
3. **Info Boxes**: Color-coded important information
4. **Call-to-Action**: Prominent branded buttons
5. **Footer**: Site links, contact info, unsubscribe option

### Responsive Design
- **Mobile-friendly**: Optimized for all screen sizes
- **Email client compatibility**: Works in Gmail, Outlook, Apple Mail, etc.
- **Fallback fonts**: Clean typography with proper fallbacks

## 🔧 Customization Options

### Adding New Email Templates
1. **Add template function to `lib/email.ts`:**
   ```typescript
   newTemplate: (param1: string, param2: string) => {
     const content = `
       <p>Your email content here</p>
     `;
     
     return createEmailTemplate({
       title: 'Email Title',
       content,
       ctaText: 'Button Text',
       ctaUrl: 'https://example.com'
     });
   }
   ```

2. **Use in your code:**
   ```typescript
   await sendEmail({
     to: user.email,
     subject: 'Subject Line',
     html: emailTemplates.newTemplate(param1, param2)
   });
   ```

### Modifying Brand Colors
Edit `lib/email-template.ts` and update the CSS variables:
```css
--primary-color: #2563eb;  /* Change to your brand color */
--background-color: #f8fafc;
--text-color: #1e293b;
```

### Adding Custom Info Boxes
Use the `createInfoBox` helper:
```typescript
const infoBox = createInfoBox(`
  <p>Important information here</p>
`, 'success'); // 'info', 'success', 'warning', 'error'
```

## 🛡️ Security Features

### Rate Limiting
- **Forgot Password**: 3 requests per 15 minutes per IP
- **Registration**: 5 requests per minute per IP
- **Automatic**: Built into API endpoints

### Email Security
- **No enumeration**: Always returns success message
- **Token validation**: Proper token verification
- **Password requirements**: Minimum 8 characters
- **Secure redirects**: Validated redirect URLs

## 📊 Monitoring & Analytics

### Email Delivery
- **Resend Dashboard**: Monitor email delivery rates
- **Supabase Logs**: Check authentication events
- **Error Handling**: Comprehensive error logging

### Performance
- **Rate limiting**: Prevents abuse
- **Efficient templates**: Optimized HTML/CSS
- **Caching**: Template system is efficient

## 🚨 Troubleshooting

### Common Issues

#### Emails Not Sending
1. **Check Resend API key** in `.env.local`
2. **Verify EMAIL_FROM** is set correctly
3. **Check Supabase configuration**
4. **Review server logs** for errors

#### Password Reset Not Working
1. **Verify Supabase redirect URLs** are set correctly
2. **Check token validation** in API logs
3. **Test with valid email address**
4. **Verify rate limiting** isn't blocking requests

#### Email Design Issues
1. **Check email client compatibility**
2. **Test responsive design** on mobile
3. **Verify brand colors** are correct
4. **Test all email templates**

### Debug Steps
1. **Check console logs** for errors
2. **Test API endpoints** directly
3. **Verify environment variables**
4. **Check Supabase dashboard** for auth events

## 📈 Next Steps

### Future Enhancements
1. **Email analytics**: Track open rates, click rates
2. **A/B testing**: Test different email designs
3. **Personalization**: Dynamic content based on user data
4. **Multi-language**: Support for different languages
5. **Email scheduling**: Send emails at optimal times

### Maintenance
1. **Regular testing**: Test email delivery monthly
2. **Update branding**: Keep colors and design current
3. **Monitor performance**: Check delivery rates
4. **User feedback**: Gather feedback on email experience

## 📞 Support

### Resources
- **Resend Documentation**: [https://resend.com/docs](https://resend.com/docs)
- **Supabase Auth**: [https://supabase.com/docs/guides/auth](https://supabase.com/docs/guides/auth)
- **Email Best Practices**: [https://www.campaignmonitor.com/resources/](https://www.campaignmonitor.com/resources/)

### Contact
- **Technical Issues**: Check server logs and error messages
- **Design Changes**: Modify `lib/email-template.ts`
- **New Templates**: Add to `lib/email.ts`

---

**Implementation Complete!** 🎉

Your Uslugo platform now has a professional, branded email system that provides a consistent user experience across all communications. Users will receive beautifully designed emails that match your site's visual identity, creating a cohesive brand experience from registration to password recovery.
