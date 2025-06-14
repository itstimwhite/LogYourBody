-- Simple Auth Workaround - No auth.users modifications
-- This avoids the "must be owner of table users" error

-- 1. Remove any existing triggers (clean slate)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 2. Check what instance_id values exist
SELECT 
    'Current instance_ids in auth.users:' as info,
    instance_id,
    COUNT(*) as user_count
FROM auth.users
GROUP BY instance_id;

-- 3. Create a function that works after user creation
CREATE OR REPLACE FUNCTION public.complete_user_setup(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_result jsonb;
BEGIN
    -- Find the user by email
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = p_email
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not found');
    END IF;
    
    -- Create profile
    INSERT INTO public.profiles (id, email, name, gender, height)
    VALUES (v_user_id, p_email, 'User', 'male', 175)
    ON CONFLICT (id) DO NOTHING;
    
    -- Create settings
    INSERT INTO public.user_settings (user_id, units)
    VALUES (v_user_id, 'imperial')
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Create subscription
    INSERT INTO public.subscriptions (user_id, status, trial_start_date, trial_end_date)
    VALUES (v_user_id, 'trial', CURRENT_DATE, CURRENT_DATE + 3)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN jsonb_build_object(
        'success', true, 
        'user_id', v_user_id,
        'message', 'User setup complete'
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false, 
        'error', SQLERRM
    );
END;
$$;

-- 4. Create a view to see users without profiles
CREATE OR REPLACE VIEW public.users_needing_setup AS
SELECT 
    u.id,
    u.email,
    u.created_at,
    p.id IS NOT NULL as has_profile,
    s.user_id IS NOT NULL as has_settings,
    sub.user_id IS NOT NULL as has_subscription
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.user_settings s ON u.id = s.user_id
LEFT JOIN public.subscriptions sub ON u.id = sub.user_id
WHERE p.id IS NULL OR s.user_id IS NULL OR sub.user_id IS NULL
ORDER BY u.created_at DESC;

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION public.complete_user_setup(text) TO anon, authenticated, service_role;
GRANT SELECT ON public.users_needing_setup TO authenticated, service_role;

-- 6. Manual process for now
SELECT 
    E'\\n=== WORKAROUND PROCESS ===\\n' ||
    '1. User signs up (will get auth error but user is created)\\n' ||
    '2. Check if user exists: SELECT * FROM users_needing_setup;\\n' ||
    '3. Complete setup: SELECT complete_user_setup(''user@email.com'');\\n' ||
    '4. User can now log in normally\\n' ||
    E'\\nThis is a temporary workaround for the Supabase auth issue.' as instructions;