-- Safe migration for Clerk integration
-- This approach creates new tables with proper types and migrates data

-- Step 1: Create new tables with TEXT user IDs
CREATE TABLE IF NOT EXISTS public.profiles_new (
    id TEXT PRIMARY KEY,
    email TEXT,
    name TEXT,
    avatar_url TEXT,
    date_of_birth DATE,
    gender TEXT,
    weight_unit TEXT DEFAULT 'kg',
    height_unit TEXT DEFAULT 'cm',
    height DECIMAL(10,2),
    activity_level TEXT,
    goal TEXT,
    settings JSONB DEFAULT '{}'::jsonb,
    email_verified BOOLEAN DEFAULT false,
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.body_metrics_new (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.profiles_new(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    weight DECIMAL(10,2),
    weight_unit TEXT DEFAULT 'kg',
    body_fat_percentage DECIMAL(5,2),
    body_fat_method TEXT,
    muscle_mass DECIMAL(10,2),
    bone_mass DECIMAL(10,2),
    photo_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.daily_metrics_new (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.profiles_new(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    steps INTEGER,
    active_calories DECIMAL(10,2),
    resting_calories DECIMAL(10,2),
    total_calories DECIMAL(10,2),
    walking_distance DECIMAL(10,2),
    running_distance DECIMAL(10,2),
    cycling_distance DECIMAL(10,2),
    swimming_distance DECIMAL(10,2),
    floors_climbed INTEGER,
    exercise_minutes INTEGER,
    stand_hours INTEGER,
    workout_type TEXT,
    workout_duration INTEGER,
    heart_rate_avg INTEGER,
    heart_rate_min INTEGER,
    heart_rate_max INTEGER,
    heart_rate_resting INTEGER,
    heart_rate_variability DECIMAL(10,2),
    sleep_hours DECIMAL(4,2),
    sleep_quality TEXT,
    water_intake DECIMAL(10,2),
    caffeine_intake DECIMAL(10,2),
    alcohol_intake DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS public.progress_photos_new (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.profiles_new(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    thumbnail_url TEXT,
    angle TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.weight_logs_new (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.profiles_new(id) ON DELETE CASCADE,
    weight DECIMAL(10,2) NOT NULL,
    weight_unit TEXT NOT NULL DEFAULT 'kg',
    notes TEXT,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.email_subscriptions_new (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.profiles_new(id) ON DELETE CASCADE,
    weekly_summary BOOLEAN DEFAULT true,
    achievement_notifications BOOLEAN DEFAULT true,
    reminder_notifications BOOLEAN DEFAULT true,
    product_updates BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_new_id ON public.profiles_new(id);
CREATE INDEX IF NOT EXISTS idx_body_metrics_new_user_id ON public.body_metrics_new(user_id);
CREATE INDEX IF NOT EXISTS idx_body_metrics_new_date ON public.body_metrics_new(date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_new_user_id ON public.daily_metrics_new(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_new_date ON public.daily_metrics_new(date DESC);
CREATE INDEX IF NOT EXISTS idx_progress_photos_new_user_id ON public.progress_photos_new(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_logs_new_user_id ON public.weight_logs_new(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_logs_new_logged_at ON public.weight_logs_new(logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_new_user_id ON public.email_subscriptions_new(user_id);

-- Step 3: Enable RLS on new tables
ALTER TABLE public.profiles_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_metrics_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_metrics_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_photos_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_logs_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_subscriptions_new ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies for new tables
-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles_new
    FOR SELECT TO authenticated
    USING (id = auth.jwt()->>'sub');

CREATE POLICY "Users can update own profile" ON public.profiles_new
    FOR UPDATE TO authenticated
    USING (id = auth.jwt()->>'sub')
    WITH CHECK (id = auth.jwt()->>'sub');

CREATE POLICY "Users can insert own profile" ON public.profiles_new
    FOR INSERT TO authenticated
    WITH CHECK (id = auth.jwt()->>'sub');

-- Body metrics policies
CREATE POLICY "Users can view own body metrics" ON public.body_metrics_new
    FOR SELECT TO authenticated
    USING (user_id = auth.jwt()->>'sub');

CREATE POLICY "Users can insert own body metrics" ON public.body_metrics_new
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.jwt()->>'sub');

CREATE POLICY "Users can update own body metrics" ON public.body_metrics_new
    FOR UPDATE TO authenticated
    USING (user_id = auth.jwt()->>'sub')
    WITH CHECK (user_id = auth.jwt()->>'sub');

CREATE POLICY "Users can delete own body metrics" ON public.body_metrics_new
    FOR DELETE TO authenticated
    USING (user_id = auth.jwt()->>'sub');

-- Daily metrics policies
CREATE POLICY "Users can view own daily metrics" ON public.daily_metrics_new
    FOR SELECT TO authenticated
    USING (user_id = auth.jwt()->>'sub');

CREATE POLICY "Users can insert own daily metrics" ON public.daily_metrics_new
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.jwt()->>'sub');

CREATE POLICY "Users can update own daily metrics" ON public.daily_metrics_new
    FOR UPDATE TO authenticated
    USING (user_id = auth.jwt()->>'sub')
    WITH CHECK (user_id = auth.jwt()->>'sub');

CREATE POLICY "Users can delete own daily metrics" ON public.daily_metrics_new
    FOR DELETE TO authenticated
    USING (user_id = auth.jwt()->>'sub');

-- Progress photos policies
CREATE POLICY "Users can view own progress photos" ON public.progress_photos_new
    FOR SELECT TO authenticated
    USING (user_id = auth.jwt()->>'sub');

CREATE POLICY "Users can insert own progress photos" ON public.progress_photos_new
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.jwt()->>'sub');

CREATE POLICY "Users can update own progress photos" ON public.progress_photos_new
    FOR UPDATE TO authenticated
    USING (user_id = auth.jwt()->>'sub')
    WITH CHECK (user_id = auth.jwt()->>'sub');

CREATE POLICY "Users can delete own progress photos" ON public.progress_photos_new
    FOR DELETE TO authenticated
    USING (user_id = auth.jwt()->>'sub');

-- Weight logs policies
CREATE POLICY "Users can view own weight logs" ON public.weight_logs_new
    FOR SELECT TO authenticated
    USING (user_id = auth.jwt()->>'sub');

CREATE POLICY "Users can insert own weight logs" ON public.weight_logs_new
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.jwt()->>'sub');

CREATE POLICY "Users can update own weight logs" ON public.weight_logs_new
    FOR UPDATE TO authenticated
    USING (user_id = auth.jwt()->>'sub')
    WITH CHECK (user_id = auth.jwt()->>'sub');

CREATE POLICY "Users can delete own weight logs" ON public.weight_logs_new
    FOR DELETE TO authenticated
    USING (user_id = auth.jwt()->>'sub');

-- Email subscriptions policies
CREATE POLICY "Users can view own email subscriptions" ON public.email_subscriptions_new
    FOR SELECT TO authenticated
    USING (user_id = auth.jwt()->>'sub');

CREATE POLICY "Users can update own email subscriptions" ON public.email_subscriptions_new
    FOR UPDATE TO authenticated
    USING (user_id = auth.jwt()->>'sub')
    WITH CHECK (user_id = auth.jwt()->>'sub');

-- Step 5: Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_new_updated_at 
    BEFORE UPDATE ON public.profiles_new 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_body_metrics_new_updated_at 
    BEFORE UPDATE ON public.body_metrics_new 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_metrics_new_updated_at 
    BEFORE UPDATE ON public.daily_metrics_new 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_photos_new_updated_at 
    BEFORE UPDATE ON public.progress_photos_new 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weight_logs_new_updated_at 
    BEFORE UPDATE ON public.weight_logs_new 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_subscriptions_new_updated_at 
    BEFORE UPDATE ON public.email_subscriptions_new 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Migrate existing data (if any)
-- This will only work if there's existing data with valid UUIDs
-- For production, you'd need a mapping table between old UUIDs and new Clerk IDs

-- Note: Since we're transitioning to Clerk, existing users will need to:
-- 1. Sign up with Clerk
-- 2. Their data will be created fresh with Clerk user IDs
-- 3. Old data can be manually migrated if needed via a separate process