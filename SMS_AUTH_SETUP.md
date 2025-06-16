# SMS Authentication Setup Guide

This guide will help you set up SMS authentication using Twilio with Supabase.

## Prerequisites

1. A Twilio account (sign up at https://www.twilio.com)
2. Supabase project with authentication enabled

## Step 1: Configure Twilio

1. Log in to your Twilio Console
2. Get your Account SID from the dashboard
3. Get your Auth Token from the dashboard
4. Purchase a phone number that supports SMS (or use the trial number)
5. If using Twilio Verify:
   - Go to Verify > Services
   - Create a new Verify Service
   - Note the Service SID

## Step 2: Configure Supabase

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Providers
3. Find "Phone" in the list and click "Enable"
4. Select "Twilio" as the SMS provider
5. Enter your Twilio credentials:
   - **Twilio Account SID**: Your Account SID from Twilio
   - **Twilio Auth Token**: Your Auth Token from Twilio
   - **Twilio Message Service SID**: Your Messaging Service SID (or Verify Service SID)

### Option B: Using Environment Variables (Local Development)

1. Create a `.env.local` file in your project root:

```bash
# Twilio Configuration
SUPABASE_AUTH_SMS_TWILIO_ACCOUNT_SID=your_account_sid
SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN=your_auth_token
SUPABASE_AUTH_SMS_TWILIO_MESSAGE_SERVICE_SID=your_service_sid
```

2. Update `supabase/config.toml`:

```toml
[auth.sms.twilio]
enabled = true
account_sid = "env(SUPABASE_AUTH_SMS_TWILIO_ACCOUNT_SID)"
message_service_sid = "env(SUPABASE_AUTH_SMS_TWILIO_MESSAGE_SERVICE_SID)"
auth_token = "env(SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN)"
```

## Step 3: Test SMS Authentication

### Using the Test Interface

1. Start your local Supabase instance:
   ```bash
   npx supabase start
   ```

2. For testing, you can use test OTPs in `supabase/config.toml`:
   ```toml
   [auth.sms.test_otp]
   4152127777 = "123456"  # Test phone number and OTP
   ```

3. Test the SMS login flow:
   - Go to `/login` in your app
   - Click on the "SMS" tab
   - Enter the test phone number: +1 (415) 212-7777
   - Click "Send Code"
   - Enter the test OTP: 123456
   - Click "Verify"

### Testing with Real SMS

1. Remove or comment out the test OTP configuration
2. Use a real phone number
3. You should receive an actual SMS with the verification code

## Step 4: Production Setup

1. In your production Supabase dashboard:
   - Go to Authentication > Providers > Phone
   - Enable SMS authentication
   - Configure Twilio with production credentials

2. Set environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Troubleshooting

### Common Issues

1. **"Phone provider is not enabled"**
   - Ensure SMS authentication is enabled in Supabase dashboard
   - Check that Twilio is properly configured

2. **Not receiving SMS**
   - Verify Twilio account is active and has credits
   - Check phone number format (+1 for US)
   - Ensure Message Service SID is correct

3. **Invalid OTP**
   - OTPs expire after 60 seconds by default
   - Ensure you're using the latest code sent

### Testing the Implementation

Run the SMS authentication tests:

```bash
npm test -- SMSLogin.test.tsx
```

### Security Considerations

1. **Rate Limiting**: Supabase automatically rate limits SMS sending to prevent abuse
2. **Phone Number Validation**: The app validates phone number format before sending
3. **OTP Expiry**: OTPs expire after a short time for security
4. **Test Mode**: Never deploy with test OTPs enabled in production

## SMS Message Template

You can customize the SMS message template in Supabase:

```toml
[auth.sms]
template = "Your LogYourBody verification code is {{ .Code }}. Valid for 60 seconds."
```

## Cost Considerations

- Twilio charges per SMS sent
- Consider implementing:
  - Daily limits per user
  - CAPTCHA for SMS requests
  - Alternative auth methods (email, social)

## Next Steps

1. Test the SMS flow thoroughly
2. Monitor Twilio usage and costs
3. Consider implementing SMS for:
   - Two-factor authentication
   - Account recovery
   - Important notifications