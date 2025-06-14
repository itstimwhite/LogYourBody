-- Immediate Auth Fix - Run this in Supabase SQL Editor
-- This focuses on the most likely cause: RLS blocking the trigger

-- 1. Enable RLS on all user tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "service_role_all_access_profiles" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.user_settings;
DROP POLICY IF EXISTS "service_role_all_access_settings" ON public.user_settings;

DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "service_role_all_access_subscriptions" ON public.subscriptions;

-- 3. Create permissive policies for service role (used by triggers)
CREATE POLICY "service_role_profiles" ON public.profiles
    FOR ALL 
    TO service_role
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "service_role_settings" ON public.user_settings
    FOR ALL 
    TO service_role
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "service_role_subscriptions" ON public.subscriptions
    FOR ALL 
    TO service_role
    USING (true) 
    WITH CHECK (true);

-- 4. Create user policies
CREATE POLICY "user_profiles_select" ON public.profiles
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "user_profiles_update" ON public.profiles
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "user_profiles_insert" ON public.profiles
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "user_settings_select" ON public.user_settings
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "user_settings_update" ON public.user_settings
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_settings_insert" ON public.user_settings
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_subscriptions_select" ON public.subscriptions
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = user_id);

-- 5. Fix the trigger function to handle edge cases better
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create profile
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
        COALESCE(NEW.email, NEW.phone || '@phone.user', NEW.id::text || '@temp.user'),
        COALESCE(
            NEW.raw_user_meta_data->>'name',
            NEW.raw_user_meta_data->>'full_name',
            split_part(COALESCE(NEW.email, ''), '@', 1),
            'User'
        ),
        COALESCE(NEW.raw_user_meta_data->>'gender', 'male'),
        COALESCE((NEW.raw_user_meta_data->>'height')::integer, 175),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Create settings
    INSERT INTO public.user_settings (
        user_id,
        units,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        'imperial',
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Create subscription
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
        NOW()::date,
        (NOW() + INTERVAL '3 days')::date,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 7. Grant permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.user_settings TO service_role;
GRANT ALL ON public.subscriptions TO service_role;

-- 8. Verify the changes
SELECT 'Setup complete. Try registering a new user now.' as message;