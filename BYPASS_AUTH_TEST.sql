-- Bypass Auth System - Create test users without Supabase Auth
-- This helps determine if the issue is with auth or our database

-- 1. Create a mock user directly in profiles (bypassing auth completely)
CREATE OR REPLACE FUNCTION public.create_mock_user(
    p_email text,
    p_name text DEFAULT 'Test User'
)
RETURNS TABLE (
    user_id uuid,
    email text,
    status text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid := gen_random_uuid();
BEGIN
    -- Create profile directly
    INSERT INTO public.profiles (
        id, 
        email, 
        name, 
        gender, 
        height,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        p_email,
        p_name,
        'male',
        175,
        NOW(),
        NOW()
    );
    
    -- Create settings
    INSERT INTO public.user_settings (
        user_id,
        units,
        health_kit_sync_enabled,
        google_fit_sync_enabled,
        notifications_enabled,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        'imperial',
        false,
        false,
        true,
        NOW(),
        NOW()
    );
    
    -- Create subscription
    INSERT INTO public.subscriptions (
        user_id,
        status,
        trial_start_date,
        trial_end_date,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        'trial',
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '3 days',
        NOW(),
        NOW()
    );
    
    RETURN QUERY 
    SELECT 
        v_user_id,
        p_email,
        'Mock user created successfully (auth bypassed)'::text;
        
EXCEPTION WHEN OTHERS THEN
    RETURN QUERY 
    SELECT 
        NULL::uuid,
        p_email,
        ('Error: ' || SQLERRM)::text;
END;
$$;

-- 2. Create a function to check if our tables are working
CREATE OR REPLACE FUNCTION public.test_table_access()
RETURNS TABLE (
    table_name text,
    can_insert boolean,
    error_message text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    test_id uuid := gen_random_uuid();
BEGIN
    -- Test profiles table
    BEGIN
        INSERT INTO public.profiles (id, email, name, gender, height)
        VALUES (test_id, 'test@test.com', 'Test', 'male', 175);
        
        DELETE FROM public.profiles WHERE id = test_id;
        
        RETURN QUERY SELECT 'profiles'::text, true, NULL::text;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 'profiles'::text, false, SQLERRM;
    END;
    
    -- Test user_settings table
    BEGIN
        INSERT INTO public.user_settings (user_id, units)
        VALUES (test_id, 'imperial');
        
        DELETE FROM public.user_settings WHERE user_id = test_id;
        
        RETURN QUERY SELECT 'user_settings'::text, true, NULL::text;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 'user_settings'::text, false, SQLERRM;
    END;
    
    -- Test subscriptions table
    BEGIN
        INSERT INTO public.subscriptions (user_id, status)
        VALUES (test_id, 'trial');
        
        DELETE FROM public.subscriptions WHERE user_id = test_id;
        
        RETURN QUERY SELECT 'subscriptions'::text, true, NULL::text;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 'subscriptions'::text, false, SQLERRM;
    END;
END;
$$;

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION public.create_mock_user(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.test_table_access() TO anon, authenticated;

-- 4. Test our tables
SELECT * FROM public.test_table_access();

-- 5. Create a test user bypassing auth
SELECT * FROM public.create_mock_user('bypass-test@example.com', 'Bypass Test User');

-- 6. Summary
SELECT 
    'If the mock user creation works but auth signup fails:' as diagnosis,
    '→ The issue is 100% in Supabase auth system' as conclusion,
    '→ Contact Supabase support with project ID: przjeunffnkjzxpykvjn' as action;