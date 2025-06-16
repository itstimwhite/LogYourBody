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
create index profiles_username_idx on public.profiles (username);
create index profiles_email_idx on public.profiles (email);

-- Enable Row Level Security
alter table public.profiles enable row level security;

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

-- Create trigger for new user creation
create or replace trigger on_auth_user_created
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

create policy "Users can view their own subscriptions"
  on public.email_subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can update their own subscriptions"
  on public.email_subscriptions for update
  using (auth.uid() = user_id);

create policy "Users can insert their own subscriptions"
  on public.email_subscriptions for insert
  with check (auth.uid() = user_id);