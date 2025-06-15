# Vercel Environment Variables Migration for Next.js

## Required Environment Variable Changes

The app has migrated from Vite to Next.js, which requires updating environment variable names in Vercel.

### For ALL Environments (Production, Preview, Development)

**OLD (Vite):**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**NEW (Next.js):**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Steps to Update in Vercel Dashboard

1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. For each environment (Production, Preview, Development):
   
   a. **Add new variables:**
   - `NEXT_PUBLIC_SUPABASE_URL` = (copy value from VITE_SUPABASE_URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (copy value from VITE_SUPABASE_ANON_KEY)
   
   b. **Remove old variables (after confirming new ones work):**
   - Delete `VITE_SUPABASE_URL`
   - Delete `VITE_SUPABASE_ANON_KEY`

## Environment-Specific Values

### Production (main branch)
```env
NEXT_PUBLIC_SUPABASE_URL=https://0fab5338-b5f2-48af-a596-591bb5b0a51c.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByempldW5mZm5ranp4cHlrdmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MTI1NDYsImV4cCI6MjA2NDk4ODU0Nn0.jZyohfzoydZKaSH_q0Tu4VqEbyFDdf-8i0kSm-YzB8w
```

### Preview (preview branch)
```env
NEXT_PUBLIC_SUPABASE_URL=https://170c7ac4-6923-4c10-b560-55d3f97e1370.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByempldW5mZm5ranp4cHlrdmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MTI1NDYsImV4cCI6MjA2NDk4ODU0Nn0.jZyohfzoydZKaSH_q0Tu4VqEbyFDdf-8i0kSm-YzB8w
```

### Development (dev branch)
```env
NEXT_PUBLIC_SUPABASE_URL=https://378a4e19-4a7d-4c2d-9f54-a28537a0e1a8.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByempldW5mZm5ranp4cHlrdmpuIiwicm9sZEQiOiJhbm9uIiwiaWF0IjoxNzQ5NDEyNTQ2LCJleHAiOjIwNjQ5ODg1NDZ9.jZyohfzoydZKaSH_q0Tu4VqEbyFDdf-8i0kSm-YzB8w
```

## Verification

After updating the environment variables:

1. Trigger a new deployment (push a commit or use "Redeploy" in Vercel)
2. Check the build logs for any environment variable errors
3. Once deployed, verify the app can connect to Supabase

## Important Notes

- Next.js requires the `NEXT_PUBLIC_` prefix for client-side environment variables
- The build will fail if these variables are not set
- Keep the RevenueCat variables as-is (they're not used in the current Next.js app yet)
- The `VITE_` prefixed variables can be removed once the new ones are working

## Quick Checklist

- [ ] Added `NEXT_PUBLIC_SUPABASE_URL` for Production
- [ ] Added `NEXT_PUBLIC_SUPABASE_ANON_KEY` for Production
- [ ] Added `NEXT_PUBLIC_SUPABASE_URL` for Preview
- [ ] Added `NEXT_PUBLIC_SUPABASE_ANON_KEY` for Preview
- [ ] Added `NEXT_PUBLIC_SUPABASE_URL` for Development
- [ ] Added `NEXT_PUBLIC_SUPABASE_ANON_KEY` for Development
- [ ] Redeployed and verified builds are passing
- [ ] Removed old VITE_ variables (after confirming everything works)