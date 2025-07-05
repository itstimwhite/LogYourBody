-- Create progress_photos table
CREATE TABLE IF NOT EXISTS public.progress_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  body_metrics_id UUID REFERENCES public.body_metrics(id) ON DELETE SET NULL,
  photo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  angle VARCHAR(20) CHECK (angle IN ('front', 'side', 'back', 'other')),
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX progress_photos_user_id_idx ON public.progress_photos(user_id);
CREATE INDEX progress_photos_date_idx ON public.progress_photos(date);
CREATE INDEX progress_photos_body_metrics_id_idx ON public.progress_photos(body_metrics_id);

-- Enable RLS
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own photos"
  ON public.progress_photos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload their own photos"
  ON public.progress_photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own photos"
  ON public.progress_photos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos"
  ON public.progress_photos FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at
CREATE TRIGGER update_progress_photos_updated_at
  BEFORE UPDATE ON public.progress_photos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();