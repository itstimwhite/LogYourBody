-- Debug query to check body_metrics table schema
-- Run this in Supabase SQL Editor to see what columns exist

-- Check columns in body_metrics table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'body_metrics'
ORDER BY ordinal_position;

-- Also check if there are any constraints
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.table_name = 'body_metrics';

-- Show a sample insert to verify column names
-- This will help identify which columns are required
SELECT 'Expected columns: id (uuid), user_id (text), date (timestamp), weight (numeric), weight_unit (text), body_fat_percentage (numeric), body_fat_method (text), muscle_mass (numeric), bone_mass (numeric), notes (text), created_at (timestamp), updated_at (timestamp)' as info;