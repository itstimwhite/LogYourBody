-- Setup Authentication for LogYourBody
-- Run this in your Supabase SQL Editor

-- Create user profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  date_of_birth date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email_verified boolean default false,
  onboarding_completed boolean default false,
  settings jsonb default '{}'::jsonb
);

-- Create indexes
create index if not exists profiles_username_idx on public.profiles (username);
create index if not exists profiles_email_idx on public.profiles (email);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;

-- Create policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Create function to handle user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, email_verified)
  values (new.id, new.email, new.email_confirmed_at is not null);
  return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Create function to update the updated_at column
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Drop existing trigger if it exists
drop trigger if exists update_profiles_updated_at on public.profiles;

-- Create trigger to automatically update updated_at
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

-- Create email_subscriptions table for marketing preferences
create table if not exists public.email_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  marketing_emails boolean default true,
  product_updates boolean default true,
  newsletter boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS for email_subscriptions
alter table public.email_subscriptions enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view their own subscriptions" on public.email_subscriptions;
drop policy if exists "Users can update their own subscriptions" on public.email_subscriptions;
drop policy if exists "Users can insert their own subscriptions" on public.email_subscriptions;

-- Create policies for email_subscriptions
create policy "Users can view their own subscriptions"
  on public.email_subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can update their own subscriptions"
  on public.email_subscriptions for update
  using (auth.uid() = user_id);

create policy "Users can insert their own subscriptions"
  on public.email_subscriptions for insert
  with check (auth.uid() = user_id);

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
grant all on all functions in schema public to anon, authenticated;

-- Test the setup by checking if tables exist
select 'Setup completed successfully!' as status;