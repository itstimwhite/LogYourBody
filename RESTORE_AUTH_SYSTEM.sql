-- Restore the original auth system after fixing the email_subscriptions issue
-- This puts back the user creation trigger that creates profiles, settings, and subscriptions

-- 1. Drop any test/debug functions we created
DROP FUNCTION IF EXISTS public.manual_user_setup(text);
DROP FUNCTION IF EXISTS public.complete_user_setup(text);
DROP FUNCTION IF EXISTS public.setup_user_data(uuid);
DROP FUNCTION IF EXISTS public.create_test_user(text, text);
DROP FUNCTION IF EXISTS public.create_mock_user(text, text);
DROP FUNCTION IF EXISTS public.test_table_access();
DROP VIEW IF EXISTS public.users_needing_setup;

-- 2. Drop the minimal trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Restore the original user creation trigger
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
    
    -- Create profile
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

-- 4. Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- 6. Verify everything is restored
SELECT 
    'Auth system restored!' as status,
    'Original trigger is now active' as message,
    'Users will automatically get profiles, settings, and trial subscriptions' as behavior;