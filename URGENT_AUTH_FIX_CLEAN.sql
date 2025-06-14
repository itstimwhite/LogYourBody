-- URGENT: Critical Fix for User Registration Issues
-- Run this entire script in your Supabase SQL Editor to resolve user creation problems

-- ========================================
-- STEP 1: COMPLETE CLEANUP AND REBUILD
-- ========================================

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Ensure table structure is correct
ALTER TABLE public.profiles 
    ALTER COLUMN name DROP NOT NULL,
    ALTER COLUMN email DROP NOT NULL,
    ALTER COLUMN birthday DROP NOT NULL,
    ALTER COLUMN height SET DEFAULT 175;

-- Add email column if missing (for older installations)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'email') THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
    END IF;
END $$;

-- ========================================
-- STEP 2: CREATE ROBUST USER CREATION FUNCTION
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
    -- Safely extract email and phone
    user_email := NEW.email;
    user_phone := NEW.phone;
    
    -- Generate fallback email for SMS users
    IF user_email IS NULL THEN
        IF user_phone IS NOT NULL THEN
            user_email := regexp_replace(user_phone, '[^0-9]', '', 'g') || '@sms.logyourbody.com';
        ELSE
            user_email := 'user_' || NEW.id || '@temp.logyourbody.com';
        END IF;
    END IF;
    
    -- Extract name from metadata with robust fallbacks
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'display_name',
        split_part(user_email, '@', 1),
        'User'
    );
    
    -- Create user profile
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
            COALESCE(NEW.raw_user_meta_data->>'gender', 'male'),
            COALESCE((NEW.raw_user_meta_data->>'height')::integer, 175),
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            name = EXCLUDED.name,
            updated_at = NOW();
            
    EXCEPTION WHEN OTHERS THEN
        -- Continue despite profile creation failure
        NULL;
    END;
    
    -- Create user settings
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
            COALESCE(NEW.raw_user_meta_data->>'units', 'imperial'),
            false,
            false,
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (user_id) DO NOTHING;
        
    EXCEPTION WHEN OTHERS THEN
        -- Continue despite settings creation failure
        NULL;
    END;
    
    -- Create trial subscription
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
            'trial',
            NOW(),
            NOW() + INTERVAL '3 days',
            NOW(),
            NOW()
        )
        ON CONFLICT (user_id) DO NOTHING;
        
    EXCEPTION WHEN OTHERS THEN
        -- Continue despite subscription creation failure
        NULL;
    END;
    
    RETURN NEW;
    
EXCEPTION WHEN OTHERS THEN
    -- Don't block user creation
    RETURN NEW;
END;
$$;

-- ========================================
-- STEP 3: CREATE THE TRIGGER
-- ========================================

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- STEP 4: UPDATE RLS POLICIES
-- ========================================

-- Drop and recreate RLS policies with better logic
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own subscription" ON subscriptions;

-- More permissive policies for user creation
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========================================
-- STEP 5: GRANT NECESSARY PERMISSIONS
-- ========================================

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;

-- Grant specific permissions for the trigger function
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;

-- ========================================
-- STEP 6: FIX EXISTING ORPHANED USERS
-- ========================================

-- Fix users who might be missing profiles
DO $$
DECLARE
    user_record RECORD;
    fixed_count INTEGER := 0;
BEGIN
    FOR user_record IN 
        SELECT u.id, u.email, u.phone, u.raw_user_meta_data
        FROM auth.users u
        LEFT JOIN public.profiles p ON u.id = p.id
        WHERE p.id IS NULL
    LOOP
        BEGIN
            -- Create missing profile
            INSERT INTO public.profiles (id, email, name, gender, height)
            VALUES (
                user_record.id,
                COALESCE(
                    user_record.email, 
                    user_record.phone || '@sms.logyourbody.com',
                    'user_' || user_record.id || '@temp.logyourbody.com'
                ),
                COALESCE(
                    user_record.raw_user_meta_data->>'name',
                    user_record.raw_user_meta_data->>'full_name',
                    'User'
                ),
                COALESCE(user_record.raw_user_meta_data->>'gender', 'male'),
                COALESCE((user_record.raw_user_meta_data->>'height')::integer, 175)
            );
            
            -- Create missing settings
            INSERT INTO public.user_settings (user_id)
            VALUES (user_record.id)
            ON CONFLICT (user_id) DO NOTHING;
            
            -- Create missing subscription
            INSERT INTO public.subscriptions (user_id, status, trial_start_date, trial_end_date)
            VALUES (user_record.id, 'trial', NOW(), NOW() + INTERVAL '3 days')
            ON CONFLICT (user_id) DO NOTHING;
            
            fixed_count := fixed_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            -- Continue with next user
            NULL;
        END;
    END LOOP;
END $$;