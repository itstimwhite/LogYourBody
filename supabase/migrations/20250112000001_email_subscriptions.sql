-- Create email_subscriptions table for marketing lists
CREATE TABLE email_subscriptions (
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

-- Create policies for email_subscriptions
-- Users can view their own subscriptions
CREATE POLICY "Users can view own email subscriptions" ON email_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own subscriptions
CREATE POLICY "Users can update own email subscriptions" ON email_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Anyone can insert new subscriptions (for public signup forms)
CREATE POLICY "Anyone can create email subscriptions" ON email_subscriptions
  FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_email_subscriptions_email ON email_subscriptions(email);
CREATE INDEX idx_email_subscriptions_user_id ON email_subscriptions(user_id);
CREATE INDEX idx_email_subscriptions_type_status ON email_subscriptions(subscription_type, status);

-- Create trigger for updated_at
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
CREATE TRIGGER sync_user_email_subscriptions_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_email_subscriptions();

-- Add some helpful views
CREATE VIEW email_subscription_stats AS
SELECT 
  subscription_type,
  status,
  COUNT(*) as count,
  COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as registered_users,
  COUNT(CASE WHEN user_id IS NULL THEN 1 END) as anonymous_subscribers
FROM email_subscriptions
GROUP BY subscription_type, status;

-- Grant necessary permissions
-- Note: In production, you might want more restrictive permissions