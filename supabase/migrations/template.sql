-- Migration Template
-- 
-- Naming convention: YYYYMMDDHHMMSS_descriptive_name.sql
-- Example: 20250116120000_add_user_preferences.sql
--
-- Best Practices:
-- 1. Always use IF NOT EXISTS / IF EXISTS clauses
-- 2. Make migrations idempotent (safe to run multiple times)
-- 3. Include both up and down migrations where possible
-- 4. Add comments explaining the purpose
-- 5. Test migrations locally before pushing
--
-- Template:

-- Purpose: [Describe what this migration does]
-- Author: [Your name]
-- Date: [Current date]

-- =====================================================
-- UP MIGRATION
-- =====================================================

-- Create new tables
-- create table if not exists public.table_name (
--   id uuid default gen_random_uuid() primary key,
--   created_at timestamp with time zone default timezone('utc'::text, now()) not null,
--   updated_at timestamp with time zone default timezone('utc'::text, now()) not null
-- );

-- Add columns
-- alter table public.table_name 
-- add column if not exists column_name data_type;

-- Create indexes
-- create index if not exists idx_name on public.table_name (column_name);

-- Enable RLS
-- alter table public.table_name enable row level security;

-- Create policies
-- create policy if not exists "policy_name"
--   on public.table_name
--   for select
--   using (auth.uid() = user_id);

-- =====================================================
-- DOWN MIGRATION (commented out for safety)
-- =====================================================
-- Only uncomment and run if you need to rollback

-- Drop policies
-- drop policy if exists "policy_name" on public.table_name;

-- Drop indexes
-- drop index if exists public.idx_name;

-- Drop columns
-- alter table public.table_name 
-- drop column if exists column_name;

-- Drop tables
-- drop table if exists public.table_name;