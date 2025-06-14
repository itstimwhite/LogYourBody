-- Fix Supabase Authentication and Database
-- Works with current Supabase auth system

-- ============================================
-- PART 1: Check what exists
-- ============================================

-- Check if auth schema and tables exist
SELECT 
    'Auth Schema' as component,
    EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') as exists;

SELECT 
    'Auth Users Table' as component,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') as exists;

-- Check existing users
SELECT COUNT(*) as existing_users FROM auth.users;

-- ============================================
-- PART 2: Clean up existing data
-- ============================================

-- Drop all existing policies
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- Drop existing functions
DROP FUNCTION IF EXISTS create_user_profile_safe CASCADE;
DROP FUNCTION IF EXISTS handle_new_user CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ============================================
-- PART 3: Create tables fresh
-- ============================================

-- Drop tables in correct order
DROP TABLE IF EXISTS daily_metrics CASCADE;
DROP TABLE IF EXISTS body_metrics CASCADE;
DROP TABLE IF EXISTS email_subscriptions CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female')) DEFAULT 'male',
  birthday DATE,
  height INTEGER DEFAULT 180,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  units TEXT CHECK (units IN ('imperial', 'metric')) DEFAULT 'imperial',
  health_kit_sync_enabled BOOLEAN DEFAULT false,
  google_fit_sync_enabled BOOLEAN DEFAULT false,
  notifications_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create body_metrics table
CREATE TABLE IF NOT EXISTS public.body_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight NUMERIC(6,2) NOT NULL,
  body_fat_percentage NUMERIC(4,1) NOT NULL,
  method TEXT CHECK (method IN ('dexa', 'scale', 'calipers', 'visual')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, date)
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('trial', 'active', 'expired', 'cancelled')) DEFAULT 'trial',
  trial_start_date TIMESTAMP WITH TIME ZONE,
  trial_end_date TIMESTAMP WITH TIME ZONE,
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  product_id TEXT,
  revenue_cat_user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id)
);

-- Create email_subscriptions table
CREATE TABLE IF NOT EXISTS public.email_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscribed BOOLEAN DEFAULT true,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_body_metrics_user_date ON body_metrics(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_body_metrics_user_created ON body_metrics(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- ============================================
-- PART 4: Enable RLS
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 5: Create RLS Policies
-- ============================================

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User settings policies
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Body metrics policies
CREATE POLICY "Users can view own metrics" ON body_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own metrics" ON body_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own metrics" ON body_metrics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own metrics" ON body_metrics
  FOR DELETE USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Email subscriptions policies
CREATE POLICY "Users can view own email subscription" ON email_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own email subscription" ON email_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email subscription" ON email_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- PART 6: Create trigger for new users
-- ============================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    )
  );
  
  -- Create user settings
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  -- Create trial subscription
  INSERT INTO public.subscriptions (user_id, status, trial_start_date, trial_end_date)
  VALUES (
    NEW.id,
    'trial',
    NOW(),
    NOW() + INTERVAL '7 days'
  );
  
  -- Create email subscription record
  INSERT INTO public.email_subscriptions (user_id, email, subscribed)
  VALUES (NEW.id, NEW.email, true);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PART 7: Create helper functions
-- ============================================

-- Updated timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create update triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_subscriptions_updated_at ON email_subscriptions;
CREATE TRIGGER update_email_subscriptions_updated_at BEFORE UPDATE ON email_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PART 8: Grant permissions
-- ============================================

-- Grant permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;

-- Specific grants for authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_settings TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON body_metrics TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON subscriptions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON email_subscriptions TO anon, authenticated;

-- ============================================
-- PART 9: Verify setup
-- ============================================

-- Check table creation
SELECT 
    tablename,
    CASE WHEN rowsecurity THEN '✅ RLS Enabled' ELSE '❌ RLS Disabled' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'user_settings', 'body_metrics', 'subscriptions', 'email_subscriptions')
ORDER BY tablename;

-- Check policies
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ============================================
-- PART 10: Test user creation
-- ============================================

DO $$
DECLARE
    test_user_id UUID;
    test_email TEXT;
BEGIN
    -- Generate test data
    test_user_id := gen_random_uuid();
    test_email := 'test-' || extract(epoch from now())::text || '@example.com';
    
    -- Try to create a test user
    BEGIN
        -- Insert into auth.users (minimal required fields)
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
            invited_at,
            confirmation_token,
            confirmation_sent_at,
            recovery_token,
            email_change_token_new,
            email_change,
            created_at,
            updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            test_user_id,
            'authenticated',
            'authenticated',
            test_email,
            crypt('TestPassword123!', gen_salt('bf')),
            NOW(),
            NULL,
            NULL,
            '',
            NULL,
            '',
            '',
            '',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE '✅ Test user created successfully!';
        
        -- Check if trigger worked
        IF EXISTS (SELECT 1 FROM profiles WHERE id = test_user_id) THEN
            RAISE NOTICE '✅ Profile trigger worked!';
        ELSE
            RAISE NOTICE '❌ Profile trigger did not fire';
        END IF;
        
        -- Clean up
        DELETE FROM auth.users WHERE id = test_user_id;
        RAISE NOTICE '✅ Test user cleaned up';
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Error creating test user: %', SQLERRM;
    END;
END $$;

-- ============================================
-- FINAL STATUS
-- ============================================

SELECT '
✅ Database setup complete!

NEXT STEPS:
1. Go to Authentication > Settings in Supabase Dashboard
2. Make sure Email Auth is enabled
3. Make sure Phone Auth is enabled  
4. For testing, disable "Enable email confirmations"
5. For testing, disable "Enable phone confirmations"
6. Try creating a user in Authentication > Users tab
7. If successful, test signup in your app

If you still have issues:
- Check if your Supabase project is active (not paused)
- Check Authentication > Providers settings
- Make sure there are no IP restrictions
' as instructions;