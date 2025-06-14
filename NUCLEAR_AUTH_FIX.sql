-- NUCLEAR OPTION: Complete auth system bypass for testing
-- This will help us determine if the issue is with auth.users creation or our trigger

-- 1. First, completely remove our trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 2. Check if there are any other triggers on auth.users
SELECT 
    tgname as trigger_name,
    tgtype,
    tgenabled as enabled,
    proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE tgrelid = 'auth.users'::regclass
AND NOT tgisinternal;

-- 3. Create a simple function to manually setup user data after registration
CREATE OR REPLACE FUNCTION public.manual_user_setup(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
BEGIN
    -- Get the user ID from email
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = user_email
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found with email: %', user_email;
    END IF;
    
    -- Create profile
    INSERT INTO public.profiles (id, email, name, gender, height)
    VALUES (v_user_id, user_email, 'User', 'male', 175)
    ON CONFLICT (id) DO NOTHING;
    
    -- Create settings
    INSERT INTO public.user_settings (user_id, units)
    VALUES (v_user_id, 'imperial')
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Create subscription
    INSERT INTO public.subscriptions (user_id, status, trial_start_date, trial_end_date)
    VALUES (v_user_id, 'trial', CURRENT_DATE, CURRENT_DATE + 3)
    ON CONFLICT (user_id) DO NOTHING;
    
    RAISE NOTICE 'User setup complete for %', user_email;
END;
$$;

-- 4. Grant execute permission
GRANT EXECUTE ON FUNCTION public.manual_user_setup(text) TO anon, authenticated;

-- 5. Create a test to see if we can even create auth users directly
DO $$
DECLARE
    test_email text := 'nuclear_test_' || extract(epoch from now())::text || '@test.com';
    test_id uuid;
BEGIN
    -- Try to create a user directly in auth.users
    BEGIN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data
        )
        VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            test_email,
            crypt('test123', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{}'
        )
        RETURNING id INTO test_id;
        
        RAISE NOTICE 'SUCCESS: Direct user creation worked! User ID: %', test_id;
        
        -- Clean up
        DELETE FROM auth.users WHERE id = test_id;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'FAILED: Direct user creation failed with: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
        RAISE NOTICE 'This suggests the issue is at the auth.users level, not our trigger';
    END;
END $$;

-- 6. Instructions
SELECT 'NUCLEAR AUTH TEST COMPLETE' as status,
       'Next steps:' as action,
       '1. Try registering a user now (trigger is disabled)' as step1,
       '2. If it works, run: SELECT manual_user_setup(''your-email@example.com'');' as step2,
       '3. If it still fails, check the test output above' as step3;