-- Create daily_metrics table for storing daily health data like step count
CREATE TABLE daily_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  step_count INTEGER,
  active_energy_burned DECIMAL(8,2), -- kcal
  resting_energy_burned DECIMAL(8,2), -- kcal
  distance_walked DECIMAL(8,2), -- km
  floors_climbed INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for daily_metrics
CREATE POLICY "Users can view own daily metrics" ON daily_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily metrics" ON daily_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily metrics" ON daily_metrics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily metrics" ON daily_metrics
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_daily_metrics_user_date ON daily_metrics(user_id, date DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_daily_metrics_updated_at BEFORE UPDATE ON daily_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();