-- Manual profile creation for testing
-- Replace the UUID with the actual user ID after registration

-- 1. First, check recent auth users
SELECT id, email, created_at, raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 2. Use this to manually create profile for a specific user
-- Replace 'YOUR_USER_ID_HERE' with the actual UUID from step 1
DO $$
DECLARE
    user_id uuid := 'YOUR_USER_ID_HERE'::uuid;
    user_email text;
    user_meta jsonb;
BEGIN
    -- Get user details
    SELECT email, raw_user_meta_data INTO user_email, user_meta
    FROM auth.users
    WHERE id = user_id;
    
    -- Create profile
    INSERT INTO public.profiles (id, email, name, gender, height)
    VALUES (
        user_id,
        user_email,
        COALESCE(user_meta->>'name', 'User'),
        'male',
        175
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Create settings
    INSERT INTO public.user_settings (user_id, units)
    VALUES (user_id, 'imperial')
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Create subscription
    INSERT INTO public.subscriptions (user_id, status, trial_start_date, trial_end_date)
    VALUES (user_id, 'trial', CURRENT_DATE, CURRENT_DATE + INTERVAL '3 days')
    ON CONFLICT (user_id) DO NOTHING;
    
    RAISE NOTICE 'Profile created for user %', user_id;
END $$;