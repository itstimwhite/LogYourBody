-- Add step_count column to body_metrics table
ALTER TABLE body_metrics ADD COLUMN step_count INTEGER;

-- Include step_count in index if needed (existing index covers user_id and date)
-- No further changes required

