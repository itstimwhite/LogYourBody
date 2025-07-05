# Supabase Setup Instructions

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization or use existing one
4. Create a new project
5. Choose a region close to your users
6. Set a strong database password

## 2. Get Project Credentials

1. Go to Project Settings > API
2. Copy the Project URL
3. Copy the anon/public key

## 3. Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 4. Run Database Migration

### Option A: Using Supabase Dashboard (Recommended for production)

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-migration.sql`
4. Click "Run" to execute the migration

### Option B: Using Supabase CLI (Local Development)

1. Install Docker Desktop (required for local development)
2. Run `npm run supabase:start` to start local Supabase
3. Run `npm run supabase:migrate` to apply migrations
4. Access local Studio at http://localhost:54323

### Available CLI Commands:

- `npm run supabase:start` - Start local Supabase instance
- `npm run supabase:stop` - Stop local Supabase instance
- `npm run supabase:reset` - Reset local database
- `npm run supabase:studio` - Open Supabase Studio
- `npm run supabase:migrate` - Push migrations to remote
- `npm run supabase:generate-types` - Generate TypeScript types

## 5. Create Storage Bucket for Progress Photos

1. Open **Storage** in Supabase Studio
2. Create a bucket named `progress-photos`
3. Set it to public so the app can display images
4. Run `npm run supabase:migrate` to apply migrations

The app uploads progress photos to this bucket and stores the URL in `body_metrics`.

This will create:

- `profiles` table for user information
- `user_settings` table for app preferences
- `body_metrics` table for body composition data
- `subscriptions` table for trial/subscription management
- Row Level Security (RLS) policies
- Indexes for performance

## 6. Configure Authentication Providers

### Google OAuth (Optional)

1. Go to Authentication > Providers
2. Enable Google provider
3. Add your Google OAuth credentials

### Apple OAuth (Optional)

1. Go to Authentication > Providers
2. Enable Apple provider
3. Add your Apple OAuth credentials

## 7. Test the Integration

1. Start your development server: `npm run dev`
2. Try creating a new account
3. Verify data is being saved to Supabase
4. Test the subscription trial flow

## Database Schema

### Tables Created:

- **profiles**: User profile information (name, email, gender, birthday, height)
- **user_settings**: App preferences (units, sync settings, notifications)
- **body_metrics**: Body composition measurements (weight, body fat %, method)
- **subscriptions**: Trial and subscription status

### Security:

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Policies prevent unauthorized access

## Features Enabled:

✅ User authentication (email, Google, Apple)
✅ User profile management
✅ Body metrics tracking
✅ Subscription/trial management
✅ Settings synchronization
✅ Real-time data updates
✅ Secure data access with RLS

## Next Steps:

1. Configure RevenueCat for subscription payments
2. Set up push notifications
3. Add file upload for profile images
4. Enable progress photo uploads
5. Configure backup and monitoring
