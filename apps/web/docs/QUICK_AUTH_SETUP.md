# Quick Authentication Setup

## Step 1: Run Database Migration

1. Go to: https://supabase.com/dashboard/project/ihivupqpctpkrgqgxfjf/sql
2. Click "New query"
3. Copy and paste the SQL from `supabase/setup-auth.sql`
4. Click "Run"

## Step 2: Configure Email Templates

1. Go to: https://supabase.com/dashboard/project/ihivupqpctpkrgqgxfjf/auth/configuration
2. Click on "Email Templates" tab
3. Update the templates:

### Confirm Signup
```html
<h2>Welcome to LogYourBody!</h2>
<p>Thanks for signing up. Please click the link below to confirm your email:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
```

### Reset Password
```html
<h2>Reset Your Password</h2>
<p>Click the link below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
```

## Step 3: Add Redirect URLs

1. Still in Auth Configuration
2. Find "Redirect URLs"
3. Add these URLs:
```
http://localhost:3000/auth/callback
http://localhost:3000/auth/reset-password
```

## Step 4: Test It!

1. Start the dev server:
```bash
npm run dev
```

2. Test signup:
   - Go to http://localhost:3000/signup
   - Create an account
   - Check your email

3. Test login:
   - Go to http://localhost:3000/login
   - Use your credentials

4. Test password reset:
   - Go to http://localhost:3000/forgot-password
   - Enter your email

## Quick Links

- SQL Editor: https://supabase.com/dashboard/project/ihivupqpctpkrgqgxfjf/sql
- Auth Config: https://supabase.com/dashboard/project/ihivupqpctpkrgqgxfjf/auth/configuration
- Auth Logs: https://supabase.com/dashboard/project/ihivupqpctpkrgqgxfjf/auth/logs