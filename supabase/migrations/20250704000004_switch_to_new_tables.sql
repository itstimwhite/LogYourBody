-- Switch application to use new tables with TEXT user IDs

-- Step 1: Rename old tables to backup
ALTER TABLE IF EXISTS public.profiles RENAME TO profiles_old;
ALTER TABLE IF EXISTS public.body_metrics RENAME TO body_metrics_old;
ALTER TABLE IF EXISTS public.daily_metrics RENAME TO daily_metrics_old;
ALTER TABLE IF EXISTS public.progress_photos RENAME TO progress_photos_old;
ALTER TABLE IF EXISTS public.weight_logs RENAME TO weight_logs_old;
ALTER TABLE IF EXISTS public.email_subscriptions RENAME TO email_subscriptions_old;

-- Step 2: Rename new tables to production names
ALTER TABLE public.profiles_new RENAME TO profiles;
ALTER TABLE public.body_metrics_new RENAME TO body_metrics;
ALTER TABLE public.daily_metrics_new RENAME TO daily_metrics;
ALTER TABLE public.progress_photos_new RENAME TO progress_photos;
ALTER TABLE public.weight_logs_new RENAME TO weight_logs;
ALTER TABLE public.email_subscriptions_new RENAME TO email_subscriptions;

-- Step 3: Update index names
ALTER INDEX IF EXISTS idx_profiles_new_id RENAME TO idx_profiles_id;
ALTER INDEX IF EXISTS idx_body_metrics_new_user_id RENAME TO idx_body_metrics_user_id;
ALTER INDEX IF EXISTS idx_body_metrics_new_date RENAME TO idx_body_metrics_date;
ALTER INDEX IF EXISTS idx_daily_metrics_new_user_id RENAME TO idx_daily_metrics_user_id;
ALTER INDEX IF EXISTS idx_daily_metrics_new_date RENAME TO idx_daily_metrics_date;
ALTER INDEX IF EXISTS idx_progress_photos_new_user_id RENAME TO idx_progress_photos_user_id;
ALTER INDEX IF EXISTS idx_weight_logs_new_user_id RENAME TO idx_weight_logs_user_id;
ALTER INDEX IF EXISTS idx_weight_logs_new_logged_at RENAME TO idx_weight_logs_logged_at;
ALTER INDEX IF EXISTS idx_email_subscriptions_new_user_id RENAME TO idx_email_subscriptions_user_id;

-- Step 4: Update trigger names
DROP TRIGGER IF EXISTS update_profiles_new_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_body_metrics_new_updated_at ON public.body_metrics;
DROP TRIGGER IF EXISTS update_daily_metrics_new_updated_at ON public.daily_metrics;
DROP TRIGGER IF EXISTS update_progress_photos_new_updated_at ON public.progress_photos;
DROP TRIGGER IF EXISTS update_weight_logs_new_updated_at ON public.weight_logs;
DROP TRIGGER IF EXISTS update_email_subscriptions_new_updated_at ON public.email_subscriptions;

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_body_metrics_updated_at 
    BEFORE UPDATE ON public.body_metrics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_metrics_updated_at 
    BEFORE UPDATE ON public.daily_metrics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_photos_updated_at 
    BEFORE UPDATE ON public.progress_photos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weight_logs_updated_at 
    BEFORE UPDATE ON public.weight_logs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_subscriptions_updated_at 
    BEFORE UPDATE ON public.email_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 5: Storage policies for photos bucket
-- Drop any existing storage policies
DROP POLICY IF EXISTS "Users can upload own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own photos" ON storage.objects;

-- Create new storage policies with Clerk JWT
CREATE POLICY "Users can upload own photos" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'photos' AND 
        (storage.foldername(name))[1] = auth.jwt()->>'sub'
    );

CREATE POLICY "Users can view own photos" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'photos' AND 
        (storage.foldername(name))[1] = auth.jwt()->>'sub'
    );

CREATE POLICY "Users can update own photos" ON storage.objects
    FOR UPDATE TO authenticated
    USING (
        bucket_id = 'photos' AND 
        (storage.foldername(name))[1] = auth.jwt()->>'sub'
    )
    WITH CHECK (
        bucket_id = 'photos' AND 
        (storage.foldername(name))[1] = auth.jwt()->>'sub'
    );

CREATE POLICY "Users can delete own photos" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'photos' AND 
        (storage.foldername(name))[1] = auth.jwt()->>'sub'
    );

-- Migration complete! The application now uses TEXT-based user IDs compatible with Clerk