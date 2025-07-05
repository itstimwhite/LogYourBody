-- Create daily_metrics table
CREATE TABLE IF NOT EXISTS public.daily_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  steps INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX daily_metrics_user_id_idx ON public.daily_metrics(user_id);
CREATE INDEX daily_metrics_date_idx ON public.daily_metrics(date);
CREATE UNIQUE INDEX daily_metrics_user_date_idx ON public.daily_metrics(user_id, date);

-- Enable RLS
ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own daily metrics"
  ON public.daily_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily metrics"
  ON public.daily_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily metrics"
  ON public.daily_metrics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily metrics"
  ON public.daily_metrics FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at
CREATE TRIGGER update_daily_metrics_updated_at
  BEFORE UPDATE ON public.daily_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();