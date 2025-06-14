-- Complete Database Fix for LogYourBody
-- This script will reset and properly configure your database
-- Run this in Supabase SQL Editor

-- ============================================
-- PART 1: Clean up existing data and policies
-- ============================================

-- Drop all existing policies first
DO $
$ 
DECLARE
    pol RECORD;
BEGIN
  FOR pol IN
  SELECT schemaname, tablename, policyname
  FROM pg_policies
  WHERE schemaname = 'public'
  LOOP
  EXECUTE format
  ('DROP POLICY IF EXISTS %I ON %I.%I', 
            pol.policyname, pol.schemaname, pol.tablename);
END
LOOP;
END $$;

-- Drop existing functions
DROP FUNCTION IF EXISTS create_user_profile_safe
CASCADE;
DROP FUNCTION IF EXISTS handle_new_user
CASCADE;

-- ============================================
-- PART 2: Recreate tables with proper structure
-- ============================================

-- Drop tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS daily_metrics
CASCADE;
DROP TABLE IF EXISTS body_metrics
CASCADE;
DROP TABLE IF EXISTS email_subscriptions
CASCADE;
DROP TABLE IF EXISTS subscriptions
CASCADE;
DROP TABLE IF EXISTS user_settings
CASCADE;
DROP TABLE IF EXISTS profiles
CASCADE;

-- Create profiles table
CREATE TABLE profiles
(
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female')) DEFAULT 'male',
  birthday DATE,
  height INTEGER DEFAULT 180,
  profile_image_url TEXT,
  created_at TIMESTAMP
  WITH TIME ZONE DEFAULT TIMEZONE
  ('utc', NOW
  ()),
  updated_at TIMESTAMP
  WITH TIME ZONE DEFAULT TIMEZONE
  ('utc', NOW
  ())
);

  -- Create user_settings table
  CREATE TABLE user_settings
  (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    units TEXT CHECK (units IN ('imperial', 'metric')) DEFAULT 'imperial',
    health_kit_sync_enabled BOOLEAN DEFAULT false,
    google_fit_sync_enabled BOOLEAN DEFAULT false,
    notifications_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP
    WITH TIME ZONE DEFAULT TIMEZONE
    ('utc', NOW
    ()),
  updated_at TIMESTAMP
    WITH TIME ZONE DEFAULT TIMEZONE
    ('utc', NOW
    ())
);

    -- Create body_metrics table
    CREATE TABLE body_metrics
    (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      weight NUMERIC(6,2) NOT NULL,
      body_fat_percentage NUMERIC(4,1) NOT NULL,
      method TEXT CHECK (method IN ('dexa', 'scale', 'calipers', 'visual')) NOT NULL,
      created_at TIMESTAMP
      WITH TIME ZONE DEFAULT TIMEZONE
      ('utc', NOW
      ()),
  UNIQUE
      (user_id, date)
);

      -- Create subscriptions table
      CREATE TABLE subscriptions
      (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        status TEXT CHECK (status IN ('trial', 'active', 'expired', 'cancelled')) DEFAULT 'trial',
        trial_start_date TIMESTAMP
        WITH TIME ZONE,
  trial_end_date TIMESTAMP
        WITH TIME ZONE,
  subscription_start_date TIMESTAMP
        WITH TIME ZONE,
  subscription_end_date TIMESTAMP
        WITH TIME ZONE,
  product_id TEXT,
  revenue_cat_user_id TEXT,
  created_at TIMESTAMP
        WITH TIME ZONE DEFAULT TIMEZONE
        ('utc', NOW
        ()),
  updated_at TIMESTAMP
        WITH TIME ZONE DEFAULT TIMEZONE
        ('utc', NOW
        ()),
  UNIQUE
        (user_id)
);

        -- Create email_subscriptions table
        CREATE TABLE email_subscriptions
        (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          subscribed BOOLEAN DEFAULT true,
          email TEXT NOT NULL,
          created_at TIMESTAMP
          WITH TIME ZONE DEFAULT TIMEZONE
          ('utc', NOW
          ()),
  updated_at TIMESTAMP
          WITH TIME ZONE DEFAULT TIMEZONE
          ('utc', NOW
          ()),
  UNIQUE
          (user_id)
);

          -- Create daily_metrics view
          CREATE OR REPLACE VIEW daily_metrics AS
          SELECT
            bm.user_id,
            bm.date,
            bm.weight,
            bm.body_fat_percentage,
            bm.method,
            -- Calculate lean mass
            bm.weight * (1 - bm.body_fat_percentage / 100) as lean_mass,
            -- Calculate fat mass
            bm.weight * (bm.body_fat_percentage / 100) as fat_mass,
            -- Get previous entry for comparison
            LAG(bm.weight) OVER (PARTITION BY bm.user_id ORDER BY bm.date) as previous_weight,
            LAG(bm.body_fat_percentage) OVER (PARTITION BY bm.user_id ORDER BY bm.date) as previous_body_fat,
            bm.created_at
          FROM body_metrics bm
          ORDER BY bm.user_id, bm.date DESC;

          -- ============================================
          -- PART 3: Create indexes for performance
          -- ============================================

          CREATE INDEX idx_body_metrics_user_date ON body_metrics(user_id, date DESC);
          CREATE INDEX idx_body_metrics_user_created ON body_metrics(user_id, created_at DESC);
          CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
          CREATE INDEX idx_subscriptions_status ON subscriptions(status);

          -- ============================================
          -- PART 4: Enable Row Level Security
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
  FOR
          SELECT USING (auth.uid() = id);

          CREATE POLICY "Users can update own profile" ON profiles
  FOR
          UPDATE USING (auth.uid()
          = id);

          CREATE POLICY "Users can insert own profile" ON profiles
  FOR
          INSERT WITH CHECK (auth.uid() =
          id);

          -- User settings policies
          CREATE POLICY "Users can view own settings" ON user_settings
  FOR
          SELECT USING (auth.uid() = user_id);

          CREATE POLICY "Users can update own settings" ON user_settings
  FOR
          UPDATE USING (auth.uid()
          = user_id);

          CREATE POLICY "Users can insert own settings" ON user_settings
  FOR
          INSERT WITH CHECK (auth.uid() =
          user_id);

          -- Body metrics policies
          CREATE POLICY "Users can view own metrics" ON body_metrics
  FOR
          SELECT USING (auth.uid() = user_id);

          CREATE POLICY "Users can insert own metrics" ON body_metrics
  FOR
          INSERT WITH CHECK (auth.uid() =
          user_id);

          CREATE POLICY "Users can update own metrics" ON body_metrics
  FOR
          UPDATE USING (auth.uid()
          = user_id);

          CREATE POLICY "Users can delete own metrics" ON body_metrics
  FOR
          DELETE USING (auth.uid
          () = user_id);

          -- Subscriptions policies
          CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR
          SELECT USING (auth.uid() = user_id);

          CREATE POLICY "Users can update own subscription" ON subscriptions
  FOR
          UPDATE USING (auth.uid()
          = user_id);

          CREATE POLICY "Users can insert own subscription" ON subscriptions
  FOR
          INSERT WITH CHECK (auth.uid() =
          user_id);

          -- Email subscriptions policies
          CREATE POLICY "Users can view own email subscription" ON email_subscriptions
  FOR
          SELECT USING (auth.uid() = user_id);

          CREATE POLICY "Users can update own email subscription" ON email_subscriptions
  FOR
          UPDATE USING (auth.uid()
          = user_id);

          CREATE POLICY "Users can insert own email subscription" ON email_subscriptions
  FOR
          INSERT WITH CHECK (auth.uid() =
          user_id);

          -- ============================================
          -- PART 6: Create helper functions
          -- ============================================

          -- Function to handle new user creation
          CREATE OR REPLACE FUNCTION public.handle_new_user
          ()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
          SET search_path
          = public
AS $$
          BEGIN
            -- Create profile
            INSERT INTO public.profiles
              (id, email, name)
            VALUES
              (
                NEW.id,
                NEW.email,
                COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );

            -- Create user settings
            INSERT INTO public.user_settings
              (user_id)
            VALUES
              (NEW.id);

            -- Create trial subscription
            INSERT INTO public.subscriptions
              (user_id, status, trial_start_date, trial_end_date)
            VALUES
              (
                NEW.id,
                'trial',
                NOW(),
                NOW() + INTERVAL
            '7 days'
  );

          -- Create email subscription
          INSERT INTO public.email_subscriptions
            (user_id, email)
          VALUES
            (NEW.id, NEW.email);

          RETURN NEW;
          END;
$$;

          -- Create trigger for new user signup
          DROP TRIGGER IF EXISTS on_auth_user_created
          ON auth.users;
          CREATE TRIGGER on_auth_user_created
  AFTER
          INSERT ON
          auth.users
          FOR EACH ROW
          EXECUTE FUNCTION
          public.handle_new_user
          ();

          -- Function to safely create user profile (for manual use)
          CREATE OR REPLACE FUNCTION public.create_user_profile_safe
          (
  user_uuid UUID,
  user_email TEXT,
  user_name TEXT,
  user_gender TEXT DEFAULT 'male',
  user_height INTEGER DEFAULT 180
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
          BEGIN
            -- Insert or update profile
            INSERT INTO profiles
              (id, email, name, gender, height)
            VALUES
              (user_uuid, user_email, user_name, user_gender, user_height)
            ON CONFLICT
            (id) DO
            UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    gender = EXCLUDED.gender,
    height = EXCLUDED.height,
    updated_at = NOW();

            -- Insert or update user settings  
            INSERT INTO user_settings
              (user_id)
            VALUES
              (user_uuid)
            ON CONFLICT
            (user_id) DO NOTHING;

            -- Insert or update subscription
            INSERT INTO subscriptions
              (user_id, status, trial_start_date, trial_end_date)
            VALUES
              (user_uuid, 'trial', NOW(), NOW() + INTERVAL
            '7 days')
  ON CONFLICT
            (user_id) DO NOTHING;

            -- Insert or update email subscription
            INSERT INTO email_subscriptions
              (user_id, email)
            VALUES
              (user_uuid, user_email)
            ON CONFLICT
            (user_id) DO NOTHING;
          END;
          $$;

          -- Grant necessary permissions
          GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
          GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
          GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
          GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;

          -- Grant specific permissions for authenticated users
          GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;
          GRANT SELECT, INSERT, UPDATE, DELETE ON user_settings TO authenticated;
          GRANT SELECT, INSERT, UPDATE, DELETE ON body_metrics TO authenticated;
          GRANT SELECT, INSERT, UPDATE, DELETE ON subscriptions TO authenticated;
          GRANT SELECT, INSERT, UPDATE, DELETE ON email_subscriptions TO authenticated;
          GRANT SELECT ON daily_metrics TO authenticated;

          -- Grant specific permissions for anon users (for signup)
          GRANT EXECUTE ON FUNCTION create_user_profile_safe TO anon, authenticated;
          GRANT EXECUTE ON FUNCTION handle_new_user TO anon, authenticated;

          -- ============================================
          -- PART 7: Update functions
          -- ============================================

          -- Function to update timestamps
          CREATE OR REPLACE FUNCTION update_updated_at_column
          ()
RETURNS TRIGGER AS $$
          BEGIN
    NEW.updated_at = TIMEZONE
          ('utc', NOW
          ());
          RETURN NEW;
          END;
$$ language 'plpgsql';

          -- Create update triggers
          CREATE TRIGGER update_profiles_updated_at BEFORE
          UPDATE ON profiles
    FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column
          ();

          CREATE TRIGGER update_user_settings_updated_at BEFORE
          UPDATE ON user_settings
    FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column
          ();

          CREATE TRIGGER update_subscriptions_updated_at BEFORE
          UPDATE ON subscriptions
    FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column
          ();

          CREATE TRIGGER update_email_subscriptions_updated_at BEFORE
          UPDATE ON email_subscriptions
    FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column
          ();

          -- ============================================
          -- PART 8: Verify setup
          -- ============================================

          -- Check all tables exist
          SELECT
            'Tables created: ' || string_agg(table_name, ', '
          ORDER BY table_name
          ) as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN
          ('profiles', 'user_settings', 'body_metrics', 'subscriptions', 'email_subscriptions');

          -- Check RLS is enabled
          SELECT
            'RLS enabled on: ' || string_agg(tablename, ', '
          ORDER BY tablename
          ) as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true
AND tablename IN
          ('profiles', 'user_settings', 'body_metrics', 'subscriptions', 'email_subscriptions');

          -- Check policies exist
          SELECT
            tablename,
            COUNT(*) as policy_count
          FROM pg_policies
          WHERE schemaname = 'public'
          GROUP BY tablename
          ORDER BY tablename;

          -- ============================================
          -- PART 9: Test user creation
          -- ============================================

          -- First, check if auth is working
          DO $$
          BEGIN
    RAISE NOTICE 'Database refresh complete!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Go to Authentication > Settings in Supabase Dashboard';
    RAISE NOTICE '2. Ensure "Enable Email Confirmations" is OFF for testing';
    RAISE NOTICE '3. Ensure "Enable Phone Confirmations" is OFF for testing';
    RAISE NOTICE '4. Try creating a user via the Authentication > Users tab';
    RAISE NOTICE '5. If that works, try signing up via your app';
          END $$;

          -- Show current auth.users (if any)
          SELECT
            id,
            email,
            created_at,
            last_sign_in_at
          FROM auth.users
          ORDER BY created_at DESC
          LIMIT 5;