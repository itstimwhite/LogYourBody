# Vercel Supabase Integration Issue

## Problem

The Vercel marketplace Supabase integration creates managed environment variables that cannot be edited. However, these may not include the required Supabase client credentials:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Solution Options

### Option 1: Add Custom Environment Variables

Since the Vercel integration manages certain variables, you can still add custom ones:

1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add NEW variables (don't edit the managed ones):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Get these values from your Supabase project:
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Go to Settings → API
   - Copy the Project URL and anon/public key

### Option 2: Use Vercel's Database URL

If Vercel only provides database connection strings, we need to:

1. Check what environment variables Vercel has set:
   - Look for: `DATABASE_URL`, `POSTGRES_URL`, etc.
   
2. These are PostgreSQL connection strings, not Supabase client credentials

3. You'll still need to manually add the Supabase client credentials

### Option 3: Disconnect and Reconnect

If the integration isn't working properly:

1. Disconnect the Supabase integration from Vercel
2. Manually add all required environment variables
3. This gives you full control over the configuration

## Checking Available Variables

To see what variables Vercel has set:

1. Go to your Vercel project
2. Settings → Environment Variables
3. Look for any Supabase or Postgres-related variables
4. Note which ones are marked as "Managed by Integration"

## Required Variables

For the LogYourBody app to work, you need:

```bash
# Client-side Supabase access
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]

# Optional: Server-side access
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
```

The app will build without these (showing warnings), but features won't work.