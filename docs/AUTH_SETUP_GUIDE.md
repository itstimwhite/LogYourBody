# Authentication Setup Guide

This guide will walk you through setting up authentication for LogYourBody.

## 1. GitHub Secrets Setup

### Required Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

1. **DEV_DATABASE_URL**
   ```
   postgres://postgres.[PROJECT-REF]:vyd_NRC2dvk@jup-qen@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

2. **PREVIEW_DATABASE_URL**
   ```
   postgres://postgres.[PROJECT-REF]:vyd_NRC2dvk@jup-qen@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

3. **PROD_DATABASE_URL**
   ```
   postgres://postgres.[PROJECT-REF]:vyd_NRC2dvk@jup-qen@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

4. **SUPABASE_ACCESS_TOKEN**
   - Get this from: https://supabase.com/dashboard/account/tokens
   - Create a new token with appropriate permissions

## 2. Supabase Configuration

### Database Setup

1. **Option A: Manual Setup (Recommended for first time)**
   - Go to your Supabase project → SQL Editor
   - Copy the contents of `supabase/setup-auth.sql`
   - Run the SQL

2. **Option B: Automated Setup**
   - Once GitHub secrets are configured
   - Push to `dev` branch to trigger migrations
   - Or manually trigger: Actions → Database Migrations → Run workflow

### Email Templates

1. Go to Supabase Dashboard → Authentication → Email Templates

2. **Confirm Signup Template**
   ```html
   <h2>Welcome to LogYourBody!</h2>
   <p>Thanks for signing up. Please click the link below to confirm your email:</p>
   <p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
   ```

3. **Reset Password Template**
   ```html
   <h2>Reset Your Password</h2>
   <p>Click the link below to reset your password:</p>
   <p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
   ```

### Authentication Settings

1. Go to Authentication → Settings
2. Configure:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: 
     ```
     http://localhost:3000/auth/callback
     http://localhost:3000/auth/reset-password
     ```

## 3. Environment Variables

Ensure your `.env.local` file has:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 4. Testing the Flow

### Test Signup
1. Start the dev server: `npm run dev`
2. Navigate to `http://localhost:3000/signup`
3. Create a new account
4. Check your email for confirmation
5. Click the confirmation link

### Test Login
1. Navigate to `http://localhost:3000/login`
2. Login with your credentials
3. Should redirect to `/dashboard`

### Test Password Reset
1. Navigate to `http://localhost:3000/forgot-password`
2. Enter your email
3. Check email for reset link
4. Click link and set new password

### Test Protected Routes
1. Try accessing `/dashboard` while logged out
2. Should redirect to `/login`
3. Login and try again
4. Should access dashboard successfully

## 5. Troubleshooting

### Database Connection Issues
```bash
# Test connection manually
npx supabase db remote list --db-url "your-database-url"
```

### Migration Issues
```bash
# Check migration status
npm run db:status

# Run migrations manually
npm run db:push
```

### Email Not Sending
1. Check Supabase Dashboard → Authentication → Logs
2. Verify email templates are configured
3. Check spam folder

### Session Issues
1. Clear browser cookies
2. Check browser console for errors
3. Verify Supabase URL and anon key

## 6. Production Checklist

- [ ] All GitHub secrets configured
- [ ] Database migrations applied
- [ ] Email templates customized
- [ ] Production URLs added to redirect allowlist
- [ ] Rate limiting configured
- [ ] Email verification required
- [ ] Password strength requirements set
- [ ] OAuth providers configured (if using)

## Next Steps

Once authentication is working:
1. Implement user profile completion
2. Add email verification status tracking
3. Set up OAuth providers (Google, Apple)
4. Implement remember me functionality
5. Add two-factor authentication