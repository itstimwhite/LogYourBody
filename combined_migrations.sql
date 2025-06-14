-- Combined Migrations for LogYourBody
-- Run this in Supabase SQL Editor if individual migrations haven't been applied

-- ============================================
-- 1. Allow null email (from 20250114000000_allow_null_email.sql)
-- ============================================

-- Check if email column is already nullable
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'email' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE profiles ALTER COLUMN email DROP NOT NULL;
        RAISE NOTICE 'Made email column nullable in profiles table';
    ELSE
        RAISE NOTICE 'Email column is already nullable';
    END IF;
END $$;

-- ============================================
-- 2. Add step count support (from 20250701000000_add_step_count.sql)
-- ============================================

-- Check if step_count column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'body_metrics' 
        AND column_name = 'step_count'
    ) THEN
        ALTER TABLE body_metrics ADD COLUMN step_count INTEGER;
        RAISE NOTICE 'Added step_count column to body_metrics table';
    ELSE
        RAISE NOTICE 'step_count column already exists';
    END IF;
END $$;

-- ============================================
-- 3. Fix authentication for SMS users
-- ============================================

-- Update the handle_new_user function to handle null emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, NEW.phone), -- Use phone if email is null
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      CASE 
        WHEN NEW.email IS NOT NULL THEN split_part(NEW.email, '@', 1)
        ELSE 'User'
      END
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
  
  -- Create email subscription only if email exists
  IF NEW.email IS NOT NULL THEN
    INSERT INTO public.email_subscriptions (user_id, email, subscribed)
    VALUES (NEW.id, NEW.email, true);
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- ============================================
-- 4. Ensure all tables have proper structure
-- ============================================

-- Add method column to body_metrics if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'body_metrics' 
        AND column_name = 'method'
    ) THEN
        ALTER TABLE body_metrics ADD COLUMN method TEXT CHECK (method IN ('dexa', 'scale', 'calipers', 'visual', 'healthkit')) DEFAULT 'scale';
        RAISE NOTICE 'Added method column to body_metrics table';
    END IF;
END $$;

-- ============================================
-- 5. Update RLS policies for better SMS support
-- ============================================

-- Drop and recreate email_subscriptions policies to be more permissive
DROP POLICY IF EXISTS "Users can insert own email subscription" ON email_subscriptions;

CREATE POLICY "Users can insert own email subscription" ON email_subscriptions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    (auth.uid() IS NOT NULL AND user_id IS NOT NULL)
  );

-- ============================================
-- Final Status Check
-- ============================================

-- Show current table structure
SELECT 
    'Tables configured successfully' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as public_tables_count;

-- Check if columns are properly configured
SELECT 
    'Email nullable: ' || is_nullable as email_status,
    'Step count added: ' || (SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'body_metrics' AND column_name = 'step_count'))::text as step_count_status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles' 
AND column_name = 'email';

-- Show message
DO $$
BEGIN
    RAISE NOTICE 'All migrations applied successfully!';
    RAISE NOTICE 'The database now supports:';
    RAISE NOTICE '- SMS-only users (null email)';
    RAISE NOTICE '- Step count tracking';
    RAISE NOTICE '- Improved authentication handling';
END $$;