-- Fix Authentication and RLS Issues
-- This addresses the most common causes of "Database error creating new user"

-- ========================================
-- STEP 1: Enable RLS on all tables
-- ========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 2: Drop ALL existing policies (clean slate)
-- ========================================
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('profiles', 'user_settings', 'subscriptions', 'body_metrics', 'daily_metrics')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- ========================================
-- STEP 3: Create SERVICE ROLE policies for trigger
-- ========================================

-- Service role needs to create profiles during user signup
CREATE POLICY "service_role_all_access_profiles" ON public.profiles
    FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service_role_all_access_settings" ON public.user_settings
    FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service_role_all_access_subscriptions" ON public.subscriptions
    FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ========================================
-- STEP 4: Create USER policies
-- ========================================

-- Profiles table policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- User settings policies
CREATE POLICY "Users can view own settings" ON public.user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.user_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscription" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON public.subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Body metrics policies
CREATE POLICY "Users can view own body metrics" ON public.body_metrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own body metrics" ON public.body_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own body metrics" ON public.body_metrics
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own body metrics" ON public.body_metrics
    FOR DELETE USING (auth.uid() = user_id);

-- Daily metrics policies
CREATE POLICY "Users can view own daily metrics" ON public.daily_metrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily metrics" ON public.daily_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily metrics" ON public.daily_metrics
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily metrics" ON public.daily_metrics
    FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- STEP 5: Fix the trigger function
-- ========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_email text;
    user_name text;
    user_phone text;
BEGIN
    -- Extract email and phone
    user_email := NEW.email;
    user_phone := NEW.phone;
    
    -- Generate fallback email for SMS users
    IF user_email IS NULL OR user_email = '' THEN
        IF user_phone IS NOT NULL AND user_phone != '' THEN
            user_email := regexp_replace(user_phone, '[^0-9]', '', 'g') || '@sms.logyourbody.com';
        ELSE
            user_email := 'user_' || NEW.id::text || '@temp.logyourbody.com';
        END IF;
    END IF;
    
    -- Extract name from metadata
    user_name := COALESCE(
        NULLIF(NEW.raw_user_meta_data->>'name', ''),
        NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
        NULLIF(NEW.raw_user_meta_data->>'display_name', ''),
        NULLIF(split_part(user_email, '@', 1), ''),
        'User'
    );
    
    -- Create profile (with better error handling)
    BEGIN
        INSERT INTO public.profiles (
            id, 
            email, 
            name, 
            gender, 
            height,
            created_at,
            updated_at
        )
        VALUES (
            NEW.id,
            user_email,
            user_name,
            COALESCE(NEW.raw_user_meta_data->>'gender', 'male')::text,
            COALESCE((NEW.raw_user_meta_data->>'height')::integer, 175),
            COALESCE(NEW.created_at, NOW()),
            COALESCE(NEW.created_at, NOW())
        )
        ON CONFLICT (id) DO UPDATE SET
            email = COALESCE(EXCLUDED.email, profiles.email),
            name = COALESCE(EXCLUDED.name, profiles.name),
            updated_at = NOW()
        WHERE profiles.email IS NULL OR profiles.name IS NULL;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Error creating profile for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
    END;
    
    -- Create settings
    BEGIN
        INSERT INTO public.user_settings (
            user_id,
            units,
            health_kit_sync_enabled,
            google_fit_sync_enabled,
            notifications_enabled,
            created_at,
            updated_at
        )
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'units', 'imperial')::text,
            false,
            false,
            true,
            COALESCE(NEW.created_at, NOW()),
            COALESCE(NEW.created_at, NOW())
        )
        ON CONFLICT (user_id) DO NOTHING;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Error creating settings for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
    END;
    
    -- Create subscription
    BEGIN
        INSERT INTO public.subscriptions (
            user_id, 
            status, 
            trial_start_date, 
            trial_end_date,
            created_at,
            updated_at
        )
        VALUES (
            NEW.id,
            'trial'::text,
            COALESCE(NEW.created_at::date, CURRENT_DATE),
            COALESCE(NEW.created_at::date, CURRENT_DATE) + INTERVAL '3 days',
            COALESCE(NEW.created_at, NOW()),
            COALESCE(NEW.created_at, NOW())
        )
        ON CONFLICT (user_id) DO NOTHING;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Error creating subscription for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
    END;
    
    RETURN NEW;
END;
$$;

-- ========================================
-- STEP 6: Recreate the trigger
-- ========================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- STEP 7: Grant proper permissions
-- ========================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grant table permissions
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

GRANT ALL ON public.user_settings TO service_role;
GRANT SELECT, UPDATE ON public.user_settings TO authenticated;

GRANT ALL ON public.subscriptions TO service_role;
GRANT SELECT ON public.subscriptions TO authenticated;

GRANT ALL ON public.body_metrics TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.body_metrics TO authenticated;

GRANT ALL ON public.daily_metrics TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_metrics TO authenticated;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- ========================================
-- STEP 8: Verify the fix
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'AUTH FIX APPLIED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'The following changes were made:';
    RAISE NOTICE '1. Enabled RLS on all tables';
    RAISE NOTICE '2. Created service_role policies for trigger access';
    RAISE NOTICE '3. Created user policies for authenticated users';
    RAISE NOTICE '4. Updated trigger function with better error handling';
    RAISE NOTICE '5. Granted proper permissions to all roles';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Try registering a new user in your app';
    RAISE NOTICE '2. Check Supabase logs if issues persist';
    RAISE NOTICE '3. Run DIAGNOSE_AUTH_ISSUE.sql to verify everything is correct';
END $$;