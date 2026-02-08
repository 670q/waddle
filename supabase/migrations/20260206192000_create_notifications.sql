-- Create user_push_tokens table
create table if not exists public.user_push_tokens (
  user_id uuid references auth.users not null primary key,
  token text not null,
  updated_at timestamptz default now()
);

-- Create announcements table for remote notifications
create table if not exists public.announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  body text not null,
  target_audience text check (target_audience in ('all', 'free', 'premium')) default 'all',
  is_sent boolean default false,
  created_at timestamptz default now()
);

-- RLS
alter table public.user_push_tokens enable row level security;
alter table public.announcements enable row level security;

-- Policies for user_push_tokens
create policy "Users manage own tokens" on public.user_push_tokens
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policies for announcements
-- Admins/Service Roles manage, Users might read (future inbox feature)
create policy "Read announcements" on public.announcements for select to authenticated using (true);
