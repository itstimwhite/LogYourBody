-- FIX: Create missing email_subscriptions table
-- This table is being referenced during auth but doesn't exist

-- 1. Create the email_subscriptions table
CREATE TABLE IF NOT EXISTS public.email_subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    email text,
    subscribed_to_marketing boolean DEFAULT false,
    subscribed_to_updates boolean DEFAULT false,
    subscribed_to_digest boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- 2. Create index for performance
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_user_id ON public.email_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email ON public.email_subscriptions(email);

-- 3. Enable RLS
ALTER TABLE public.email_subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
CREATE POLICY "Users can view own email subscriptions" ON public.email_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own email subscriptions" ON public.email_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email subscriptions" ON public.email_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Create service role policy for auth system
CREATE POLICY "Service role full access" ON public.email_subscriptions
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 6. Grant permissions
GRANT ALL ON public.email_subscriptions TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.email_subscriptions TO authenticated;

-- 7. Create a function to handle email subscription creation
CREATE OR REPLACE FUNCTION public.handle_email_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Create email subscription record when user is created
    INSERT INTO public.email_subscriptions (
        user_id,
        email,
        subscribed_to_marketing,
        subscribed_to_updates,
        subscribed_to_digest
    )
    VALUES (
        NEW.id,
        NEW.email,
        false,  -- Default to unsubscribed
        false,
        false
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$;

-- 8. Create trigger for new users
CREATE TRIGGER on_user_created_email_subscription
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_email_subscription();

-- 9. Fix existing users without email subscriptions
INSERT INTO public.email_subscriptions (user_id, email)
SELECT 
    u.id,
    u.email
FROM auth.users u
LEFT JOIN public.email_subscriptions es ON u.id = es.user_id
WHERE es.id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- 10. Verify the fix
SELECT 
    'Email subscriptions table created successfully!' as status,
    COUNT(*) as total_records
FROM public.email_subscriptions;

-- Now try creating a user again!