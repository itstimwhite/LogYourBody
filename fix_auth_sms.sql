-- Fix Supabase SMS Authentication Error
-- This addresses the "Database error saving new user" issue

-- ============================================
-- STEP 1: Check Auth System Health
-- ============================================

-- Check if auth schema exists and is accessible
SELECT 
    EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') as auth_exists,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') as users_table_exists;

-- Check current user count
SELECT COUNT(*) as total_users FROM auth.users;

-- ============================================
-- STEP 2: Check for Blocking Triggers
-- ============================================

-- List all triggers on auth.users that might be blocking
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth' 
AND event_object_table = 'users'
ORDER BY trigger_name;

-- ============================================
-- STEP 3: Fix Common Auth Issues
-- ============================================

-- Ensure auth instance exists
INSERT INTO auth.instances (id, uuid, raw_base_config, created_at, updated_at)
SELECT 
    '00000000-0000-0000-0000-000000000000'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    '{}'::jsonb,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM auth.instances);

-- Check if phone column exists and has proper constraints
SELECT 
    column_name,
    data_type,
    is_nullable,
    character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'auth' 
AND table_name = 'users'
AND column_name IN ('phone', 'phone_confirmed_at', 'phone_change', 'phone_change_token');

-- ============================================
-- STEP 4: Test Direct User Creation
-- ============================================

DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    instance_id UUID;
    error_msg TEXT;
BEGIN
    -- Get instance ID
    SELECT id INTO instance_id FROM auth.instances LIMIT 1;
    IF instance_id IS NULL THEN
        instance_id := '00000000-0000-0000-0000-000000000000'::uuid;
    END IF;
    
    -- Test 1: Create user with email
    BEGIN
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            aud,
            role
        ) VALUES (
            test_user_id,
            instance_id,
            'email-test-' || extract(epoch from now())::text || '@example.com',
            crypt('TestPassword123!', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            'authenticated',
            'authenticated'
        );
        
        RAISE NOTICE '✅ Email user creation works!';
        DELETE FROM auth.users WHERE id = test_user_id;
        
    EXCEPTION
        WHEN OTHERS THEN
            GET STACKED DIAGNOSTICS error_msg = MESSAGE_TEXT;
            RAISE NOTICE '❌ Email user creation failed: %', error_msg;
    END;
    
    -- Test 2: Create user with phone
    BEGIN
        test_user_id := gen_random_uuid();
        INSERT INTO auth.users (
            id,
            instance_id,
            phone,
            phone_confirmed_at,
            created_at,
            updated_at,
            aud,
            role
        ) VALUES (
            test_user_id,
            instance_id,
            '+1555' || (random() * 9999999)::int::text,
            NOW(),
            NOW(),
            NOW(),
            'authenticated',
            'authenticated'
        );
        
        RAISE NOTICE '✅ Phone user creation works!';
        DELETE FROM auth.users WHERE id = test_user_id;
        
    EXCEPTION
        WHEN OTHERS THEN
            GET STACKED DIAGNOSTICS error_msg = MESSAGE_TEXT;
            RAISE NOTICE '❌ Phone user creation failed: %', error_msg;
            RAISE NOTICE 'This is likely the SMS auth issue!';
    END;
END $$;

-- ============================================
-- STEP 5: Check Required Columns
-- ============================================

-- Add phone columns if missing
DO $$
BEGIN
    -- Add phone column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'auth' 
                   AND table_name = 'users' 
                   AND column_name = 'phone') THEN
        ALTER TABLE auth.users ADD COLUMN phone TEXT UNIQUE;
        RAISE NOTICE 'Added phone column';
    END IF;
    
    -- Add phone_confirmed_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'auth' 
                   AND table_name = 'users' 
                   AND column_name = 'phone_confirmed_at') THEN
        ALTER TABLE auth.users ADD COLUMN phone_confirmed_at TIMESTAMPTZ;
        RAISE NOTICE 'Added phone_confirmed_at column';
    END IF;
    
    -- Add phone_change column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'auth' 
                   AND table_name = 'users' 
                   AND column_name = 'phone_change') THEN
        ALTER TABLE auth.users ADD COLUMN phone_change TEXT;
        RAISE NOTICE 'Added phone_change column';
    END IF;
    
    -- Add phone_change_token column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'auth' 
                   AND table_name = 'users' 
                   AND column_name = 'phone_change_token') THEN
        ALTER TABLE auth.users ADD COLUMN phone_change_token TEXT;
        RAISE NOTICE 'Added phone_change_token column';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding columns: %', SQLERRM;
END $$;

-- ============================================
-- STEP 6: Check Identities Table
-- ============================================

-- Check if identities table exists and has proper structure
SELECT 
    'Identities table check:' as info,
    EXISTS (SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'auth' 
            AND table_name = 'identities') as table_exists;

-- Check identities columns
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'auth' 
AND table_name = 'identities'
ORDER BY ordinal_position
LIMIT 10;

-- ============================================
-- STEP 7: Fix Permissions
-- ============================================

-- Grant all necessary permissions
GRANT ALL ON SCHEMA auth TO postgres, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA auth TO postgres, service_role;

-- ============================================
-- STEP 8: Check for Custom Constraints
-- ============================================

-- List all constraints that might block user creation
SELECT 
    con.conname AS constraint_name,
    con.contype AS constraint_type,
    pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_namespace nsp ON nsp.oid = con.connamespace
JOIN pg_class cls ON cls.oid = con.conrelid
WHERE nsp.nspname = 'auth'
AND cls.relname = 'users'
AND con.contype IN ('c', 'u', 'x')  -- check, unique, exclusion
ORDER BY con.conname;

-- ============================================
-- STEP 9: Temporary Workaround
-- ============================================

-- Create a function to handle SMS signup manually
CREATE OR REPLACE FUNCTION public.create_phone_user(
    phone_number TEXT,
    otp_code TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_user_id UUID;
    instance_id UUID;
    result JSON;
BEGIN
    -- Get instance ID
    SELECT id INTO instance_id FROM auth.instances LIMIT 1;
    IF instance_id IS NULL THEN
        instance_id := '00000000-0000-0000-0000-000000000000'::uuid;
    END IF;
    
    -- Generate new user ID
    new_user_id := gen_random_uuid();
    
    -- Try to create user
    BEGIN
        INSERT INTO auth.users (
            id,
            instance_id,
            phone,
            phone_confirmed_at,
            created_at,
            updated_at,
            aud,
            role,
            raw_user_meta_data
        ) VALUES (
            new_user_id,
            instance_id,
            phone_number,
            NOW(), -- Auto-confirm for now
            NOW(),
            NOW(),
            'authenticated',
            'authenticated',
            jsonb_build_object('provider', 'phone')
        );
        
        -- Create profile using existing trigger
        -- The handle_new_user trigger should fire automatically
        
        result := json_build_object(
            'success', true,
            'user_id', new_user_id,
            'message', 'User created successfully'
        );
        
    EXCEPTION
        WHEN OTHERS THEN
            result := json_build_object(
                'success', false,
                'error', SQLERRM,
                'hint', 'Check if phone number already exists or auth system issue'
            );
    END;
    
    RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.create_phone_user TO anon, authenticated;

-- ============================================
-- FINAL DIAGNOSIS
-- ============================================

SELECT '
DIAGNOSIS RESULTS
=================

Based on the tests above, here are the next steps:

1. If phone columns were missing and added → Try SMS auth again
2. If email works but phone fails → Phone provider configuration issue
3. If both fail → Core auth system issue

IMMEDIATE FIXES TO TRY:
-----------------------
1. In Supabase Dashboard:
   - Go to Authentication > Providers > Phone
   - Toggle Phone provider OFF and then ON again
   - Make sure "Enable phone confirmations" is OFF

2. Check Project Status:
   - Go to Settings > General
   - Make sure project is not paused
   - Check if you have any API rate limits

3. For Testing:
   - Use the create_phone_user function as a workaround:
   SELECT create_phone_user(''+15551234567'');

4. If nothing works:
   - Contact Supabase support
   - Share the error: "Database error saving new user"
   - Mention SMS/Phone auth specifically fails
' as next_steps;