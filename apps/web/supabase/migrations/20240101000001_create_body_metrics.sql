-- Create body_metrics table
CREATE TABLE IF NOT EXISTS public.body_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  weight DECIMAL(6,2),
  weight_unit VARCHAR(10) DEFAULT 'kg',
  body_fat_percentage DECIMAL(5,2),
  body_fat_method VARCHAR(20),
  muscle_mass DECIMAL(6,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX body_metrics_user_id_idx ON public.body_metrics(user_id);
CREATE INDEX body_metrics_date_idx ON public.body_metrics(date);
CREATE UNIQUE INDEX body_metrics_user_date_idx ON public.body_metrics(user_id, date);

-- Enable RLS
ALTER TABLE public.body_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own metrics"
  ON public.body_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own metrics"
  ON public.body_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own metrics"
  ON public.body_metrics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own metrics"
  ON public.body_metrics FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at
CREATE TRIGGER update_body_metrics_updated_at
  BEFORE UPDATE ON public.body_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();