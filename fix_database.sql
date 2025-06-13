-- Manual SQL to fix Apple Sign In database errors
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/przjeunffnkjzxpykvjn/sql

-- First, check if the email_subscriptions table exists
-- If it doesn't exist, create it:

CREATE TABLE IF NOT EXISTS email_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  subscription_type TEXT CHECK (subscription_type IN ('changelog', 'newsletter', 'product_updates', 'promotions')) NOT NULL,
  status TEXT CHECK (status IN ('subscribed', 'unsubscribed', 'bounced', 'complained')) NOT NULL DEFAULT 'subscribed',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL if subscriber is not a registered user
  metadata JSONB DEFAULT '{}', -- Store additional data like source, preferences, etc.
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique subscription per email per type
  UNIQUE(email, subscription_type)
);

-- Enable Row Level Security
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for email_subscriptions (only if they don't exist)
DO $$
BEGIN
  -- Check if policy exists, create if not
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'email_subscriptions' 
    AND policyname = 'Users can view own email subscriptions'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view own email subscriptions" ON email_subscriptions FOR SELECT USING (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'email_subscriptions' 
    AND policyname = 'Users can update own email subscriptions'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update own email subscriptions" ON email_subscriptions FOR UPDATE USING (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'email_subscriptions' 
    AND policyname = 'Anyone can create email subscriptions'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can create email subscriptions" ON email_subscriptions FOR INSERT WITH CHECK (true)';
  END IF;
END $$;

-- Create indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email ON email_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_user_id ON email_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_type_status ON email_subscriptions(subscription_type, status);

-- Check if update_updated_at_column function exists, create if not
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at (drop and recreate to ensure it works)
DROP TRIGGER IF EXISTS update_email_subscriptions_updated_at ON email_subscriptions;
CREATE TRIGGER update_email_subscriptions_updated_at 
  BEFORE UPDATE ON email_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to sync user email subscriptions when they register
CREATE OR REPLACE FUNCTION sync_user_email_subscriptions()
RETURNS TRIGGER AS $$
BEGIN
  -- Update existing email subscriptions with the new user_id
  UPDATE email_subscriptions 
  SET user_id = NEW.id, updated_at = NOW()
  WHERE email = NEW.email AND user_id IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically sync email subscriptions when a user signs up
DROP TRIGGER IF EXISTS sync_user_email_subscriptions_trigger ON auth.users;
CREATE TRIGGER sync_user_email_subscriptions_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_email_subscriptions();

-- Check if daily_metrics table exists and create if needed
CREATE TABLE IF NOT EXISTS daily_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  step_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable RLS for daily_metrics
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for daily_metrics
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'daily_metrics' 
    AND policyname = 'Users can view own daily metrics'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view own daily metrics" ON daily_metrics FOR SELECT USING (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'daily_metrics' 
    AND policyname = 'Users can insert own daily metrics'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can insert own daily metrics" ON daily_metrics FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'daily_metrics' 
    AND policyname = 'Users can update own daily metrics'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update own daily metrics" ON daily_metrics FOR UPDATE USING (auth.uid() = user_id)';
  END IF;
END $$;

-- Add trigger for daily_metrics updated_at
DROP TRIGGER IF EXISTS update_daily_metrics_updated_at ON daily_metrics;
CREATE TRIGGER update_daily_metrics_updated_at 
  BEFORE UPDATE ON daily_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Refresh permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;

-- Success message
SELECT 'Database migration completed successfully!' as result;