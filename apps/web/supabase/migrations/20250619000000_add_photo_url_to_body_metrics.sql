-- Add photo_url column to body_metrics table
ALTER TABLE public.body_metrics
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.body_metrics.photo_url IS 'URL to progress photo associated with this metric entry';