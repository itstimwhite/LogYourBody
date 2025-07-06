-- Supabase RLS Setup for LogYourBody with Clerk Integration
-- Run this script in the Supabase SQL Editor

-- First, let's check if the tables exist and their structure
-- This helps verify we're working with the right schema

-- Check current user to debug JWT
SELECT auth.jwt() as current_jwt;

-- ================================================
-- BODY METRICS TABLE
-- ================================================

-- Enable RLS on body_metrics table
ALTER TABLE body_metrics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to start fresh)
DROP POLICY IF EXISTS "Users can read own body metrics" ON body_metrics;
DROP POLICY IF EXISTS "Users can insert own body metrics" ON body_metrics;
DROP POLICY IF EXISTS "Users can update own body metrics" ON body_metrics;
DROP POLICY IF EXISTS "Users can delete own body metrics" ON body_metrics;

-- Create new policies for body_metrics
-- Read policy
CREATE POLICY "Users can read own body metrics" ON body_metrics
    FOR SELECT
    USING (auth.jwt() ->> 'sub' = user_id);

-- Insert policy
CREATE POLICY "Users can insert own body metrics" ON body_metrics
    FOR INSERT
    WITH CHECK (auth.jwt() ->> 'sub' = user_id);

-- Update policy
CREATE POLICY "Users can update own body metrics" ON body_metrics
    FOR UPDATE
    USING (auth.jwt() ->> 'sub' = user_id)
    WITH CHECK (auth.jwt() ->> 'sub' = user_id);

-- Delete policy
CREATE POLICY "Users can delete own body metrics" ON body_metrics
    FOR DELETE
    USING (auth.jwt() ->> 'sub' = user_id);

-- ================================================
-- DAILY METRICS TABLE
-- ================================================

-- Enable RLS on daily_metrics table
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can read own daily metrics" ON daily_metrics;
DROP POLICY IF EXISTS "Users can insert own daily metrics" ON daily_metrics;
DROP POLICY IF EXISTS "Users can update own daily metrics" ON daily_metrics;
DROP POLICY IF EXISTS "Users can delete own daily metrics" ON daily_metrics;

-- Create new policies for daily_metrics
-- Read policy
CREATE POLICY "Users can read own daily metrics" ON daily_metrics
    FOR SELECT
    USING (auth.jwt() ->> 'sub' = user_id);

-- Insert policy
CREATE POLICY "Users can insert own daily metrics" ON daily_metrics
    FOR INSERT
    WITH CHECK (auth.jwt() ->> 'sub' = user_id);

-- Update policy
CREATE POLICY "Users can update own daily metrics" ON daily_metrics
    FOR UPDATE
    USING (auth.jwt() ->> 'sub' = user_id)
    WITH CHECK (auth.jwt() ->> 'sub' = user_id);

-- Delete policy
CREATE POLICY "Users can delete own daily metrics" ON daily_metrics
    FOR DELETE
    USING (auth.jwt() ->> 'sub' = user_id);

-- ================================================
-- USER PROFILES TABLE
-- ================================================

-- Enable RLS on user_profiles table (if it exists)
-- Note: Some setups might use 'profiles' instead of 'user_profiles'
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies
        DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
        DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
        DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
        
        -- Create policies (note: user_profiles uses 'id' not 'user_id')
        CREATE POLICY "Users can read own profile" ON user_profiles
            FOR SELECT
            USING (auth.jwt() ->> 'sub' = id);
        
        CREATE POLICY "Users can insert own profile" ON user_profiles
            FOR INSERT
            WITH CHECK (auth.jwt() ->> 'sub' = id);
        
        CREATE POLICY "Users can update own profile" ON user_profiles
            FOR UPDATE
            USING (auth.jwt() ->> 'sub' = id)
            WITH CHECK (auth.jwt() ->> 'sub' = id);
    END IF;
END $$;

-- Alternative: If your table is named 'profiles' instead
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies
        DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
        DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
        DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
        
        -- Create policies
        CREATE POLICY "Users can read own profile" ON profiles
            FOR SELECT
            USING (auth.jwt() ->> 'sub' = id);
        
        CREATE POLICY "Users can insert own profile" ON profiles
            FOR INSERT
            WITH CHECK (auth.jwt() ->> 'sub' = id);
        
        CREATE POLICY "Users can update own profile" ON profiles
            FOR UPDATE
            USING (auth.jwt() ->> 'sub' = id)
            WITH CHECK (auth.jwt() ->> 'sub' = id);
    END IF;
END $$;

-- ================================================
-- WEIGHT LOGS TABLE (if exists)
-- ================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'weight_logs') THEN
        ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies
        DROP POLICY IF EXISTS "Users can read own weight logs" ON weight_logs;
        DROP POLICY IF EXISTS "Users can insert own weight logs" ON weight_logs;
        DROP POLICY IF EXISTS "Users can update own weight logs" ON weight_logs;
        DROP POLICY IF EXISTS "Users can delete own weight logs" ON weight_logs;
        
        -- Create policies
        CREATE POLICY "Users can read own weight logs" ON weight_logs
            FOR SELECT
            USING (auth.jwt() ->> 'sub' = user_id);
        
        CREATE POLICY "Users can insert own weight logs" ON weight_logs
            FOR INSERT
            WITH CHECK (auth.jwt() ->> 'sub' = user_id);
        
        CREATE POLICY "Users can update own weight logs" ON weight_logs
            FOR UPDATE
            USING (auth.jwt() ->> 'sub' = user_id)
            WITH CHECK (auth.jwt() ->> 'sub' = user_id);
        
        CREATE POLICY "Users can delete own weight logs" ON weight_logs
            FOR DELETE
            USING (auth.jwt() ->> 'sub' = user_id);
    END IF;
END $$;

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- List all tables with RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- List all policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Test query to see what the JWT contains
-- This will show you the structure of the Clerk JWT
SELECT 
    auth.jwt() as full_jwt,
    auth.jwt() ->> 'sub' as user_id,
    auth.jwt() ->> 'email' as email,
    auth.jwt() -> 'user_metadata' as metadata;