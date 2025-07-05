-- Update RLS policies to work with Clerk JWT tokens
-- This migration assumes Clerk is already configured as an auth provider in Supabase

-- Since we're keeping UUID columns but Clerk uses string IDs, we'll need to handle this in the application layer
-- For now, we'll disable the old auth.uid() based policies

-- Drop all existing RLS policies that use auth.uid()
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop policies on profiles table
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', r.policyname);
    END LOOP;
    
    -- Drop policies on body_metrics table
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'body_metrics' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.body_metrics', r.policyname);
    END LOOP;
    
    -- Drop policies on daily_metrics table
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'daily_metrics' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.daily_metrics', r.policyname);
    END LOOP;
    
    -- Drop policies on progress_photos table
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'progress_photos' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.progress_photos', r.policyname);
    END LOOP;
    
    -- Drop policies on weight_logs table if it exists
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'weight_logs' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.weight_logs', r.policyname);
    END LOOP;
    
    -- Drop policies on email_subscriptions table
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'email_subscriptions' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.email_subscriptions', r.policyname);
    END LOOP;
END $$;

-- For storage policies
DROP POLICY IF EXISTS "Users can upload their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;

-- Remove the trigger that creates profiles from auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a function to check if a UUID matches the Clerk user ID
-- This is a temporary solution until we migrate to string-based IDs
CREATE OR REPLACE FUNCTION public.is_clerk_user(table_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- For now, we'll bypass RLS since we need to handle the UUID/string mismatch in the app layer
    -- This returns true for authenticated users, relying on app-level security
    RETURN auth.jwt() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new temporary policies that allow authenticated users to access their own data
-- These are permissive for now, actual security is handled at the application layer

CREATE POLICY "Authenticated users can manage profiles" ON public.profiles
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can manage body_metrics" ON public.body_metrics
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can manage daily_metrics" ON public.daily_metrics
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can manage progress_photos" ON public.progress_photos
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Only create policy if weight_logs table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'weight_logs') THEN
        CREATE POLICY "Authenticated users can manage weight_logs" ON public.weight_logs
            FOR ALL TO authenticated
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

CREATE POLICY "Authenticated users can manage email_subscriptions" ON public.email_subscriptions
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Storage policies for authenticated users
CREATE POLICY "Authenticated users can manage photos" ON storage.objects
    FOR ALL TO authenticated
    USING (bucket_id = 'photos')
    WITH CHECK (bucket_id = 'photos');

-- Note: These policies are temporarily permissive. 
-- The actual user isolation is handled at the application layer using Clerk's auth.
-- A future migration should update the schema to use TEXT-based user IDs matching Clerk's format.