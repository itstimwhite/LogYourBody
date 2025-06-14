-- Fix for Supabase Auth Admin API 500 Error
-- This addresses common causes of "unexpected_failure" in user creation

-- 1. Check if instance_id is set correctly
SELECT 
    'Checking instance_id configuration...' as status;

-- Get the correct instance_id from existing data
SELECT DISTINCT 
    instance_id,
    COUNT(*) as user_count
FROM auth.users
GROUP BY instance_id;

-- 2. Check auth.users required fields
SELECT 
    column_name,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'auth' 
AND table_name = 'users'
AND is_nullable = 'NO'
AND column_default IS NULL
ORDER BY ordinal_position;

-- 3. Fix common auth.users issues
DO $$
DECLARE
    correct_instance_id uuid;
BEGIN
    -- Get the most common instance_id (or generate one if none exist)
    SELECT COALESCE(
        (SELECT instance_id FROM auth.users WHERE instance_id IS NOT NULL LIMIT 1),
        '00000000-0000-0000-0000-000000000000'::uuid
    ) INTO correct_instance_id;
    
    RAISE NOTICE 'Using instance_id: %', correct_instance_id;
    
    -- Update any NULL instance_ids
    UPDATE auth.users 
    SET instance_id = correct_instance_id 
    WHERE instance_id IS NULL;
    
    -- Set default for future inserts
    IF NOT EXISTS (
        SELECT 1 FROM pg_attrdef a
        JOIN pg_attribute att ON a.adrelid = att.attrelid AND a.adnum = att.attnum
        WHERE att.attrelid = 'auth.users'::regclass
        AND att.attname = 'instance_id'
    ) THEN
        EXECUTE format('ALTER TABLE auth.users ALTER COLUMN instance_id SET DEFAULT %L::uuid', correct_instance_id);
        RAISE NOTICE 'Set default instance_id for auth.users';
    END IF;
END $$;

-- 4. Create a minimal working trigger function
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Just return NEW without doing anything
    -- This ensures the trigger doesn't interfere with user creation
    RETURN NEW;
END;
$$;

-- 5. Create the trigger with proper error handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 6. Create a separate function to setup user data
-- This can be called manually or in a separate process
CREATE OR REPLACE FUNCTION public.setup_user_data(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_email text;
    v_phone text;
    v_metadata jsonb;
BEGIN
    -- Get user data
    SELECT email, phone, raw_user_meta_data 
    INTO v_email, v_phone, v_metadata
    FROM auth.users 
    WHERE id = p_user_id;
    
    -- Create profile if doesn't exist
    INSERT INTO public.profiles (
        id, email, name, gender, height
    ) VALUES (
        p_user_id,
        COALESCE(v_email, p_user_id::text || '@user.temp'),
        COALESCE(v_metadata->>'name', 'User'),
        'male',
        175
    ) ON CONFLICT (id) DO NOTHING;
    
    -- Create settings if doesn't exist
    INSERT INTO public.user_settings (
        user_id, units
    ) VALUES (
        p_user_id, 'imperial'
    ) ON CONFLICT (user_id) DO NOTHING;
    
    -- Create subscription if doesn't exist
    INSERT INTO public.subscriptions (
        user_id, status, trial_start_date, trial_end_date
    ) VALUES (
        p_user_id, 'trial', CURRENT_DATE, CURRENT_DATE + 3
    ) ON CONFLICT (user_id) DO NOTHING;
    
EXCEPTION WHEN OTHERS THEN
    -- Log but don't fail
    RAISE WARNING 'Error setting up user data for %: %', p_user_id, SQLERRM;
END;
$$;

-- 7. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;
GRANT EXECUTE ON FUNCTION public.setup_user_data(uuid) TO postgres, service_role, authenticated;

-- 8. Test with minimal user creation
DO $$
DECLARE
    test_id uuid := gen_random_uuid();
    instance_id uuid;
BEGIN
    -- Get instance_id to use
    SELECT COALESCE(
        (SELECT auth.users.instance_id FROM auth.users LIMIT 1),
        '00000000-0000-0000-0000-000000000000'::uuid
    ) INTO instance_id;
    
    -- Try minimal insert
    BEGIN
        INSERT INTO auth.users (
            id,
            instance_id,
            aud,
            role,
            email,
            created_at,
            updated_at
        ) VALUES (
            test_id,
            instance_id,
            'authenticated',
            'authenticated', 
            'minimal_test_' || extract(epoch from now())::text || '@test.com',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'SUCCESS: Minimal user creation worked!';
        
        -- Cleanup
        DELETE FROM auth.users WHERE id = test_id;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'FAILED: Even minimal user creation failed: %', SQLERRM;
    END;
END $$;

-- 9. Alternative: Completely bypass auth.users for testing
CREATE OR REPLACE FUNCTION public.create_test_user(
    p_email text,
    p_password text DEFAULT 'TestPassword123!'
)
RETURNS TABLE (user_id uuid, status text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid := gen_random_uuid();
BEGIN
    -- Create minimal profile directly
    INSERT INTO public.profiles (id, email, name, gender, height)
    VALUES (v_user_id, p_email, 'Test User', 'male', 175);
    
    -- Create settings
    INSERT INTO public.user_settings (user_id, units)
    VALUES (v_user_id, 'imperial');
    
    -- Create subscription
    INSERT INTO public.subscriptions (user_id, status, trial_start_date, trial_end_date)
    VALUES (v_user_id, 'trial', CURRENT_DATE, CURRENT_DATE + 3);
    
    RETURN QUERY SELECT v_user_id, 'User created (auth bypassed)'::text;
    
EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT NULL::uuid, ('Error: ' || SQLERRM)::text;
END;
$$;

-- 10. Summary
SELECT 'Auth fix applied. Try these in order:' as instruction,
       '1. Try normal signup again' as step1,
       '2. If it works but no profile, run: SELECT setup_user_data(user_id_here);' as step2,
       '3. For testing without auth: SELECT * FROM create_test_user(''test@example.com'');' as step3;