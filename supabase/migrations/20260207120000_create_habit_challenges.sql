-- Create habit_challenges table
create table if not exists public.habit_challenges (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  habit_id uuid references public.habits(id) on delete cascade not null,
  start_date date not null default CURRENT_DATE,
  end_date date generated always as (start_date + interval '20 days') stored, -- 21 days total (start + 20)
  status text not null check (status in ('active', 'completed', 'failed')) default 'active',
  current_day integer not null default 0, -- Progress 0-21
  longest_streak integer not null default 0,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.habit_challenges enable row level security;

-- Policies
create policy "Users can view their own habit challenges"
  on public.habit_challenges for select
  using (auth.uid() = user_id);

create policy "Users can insert their own habit challenges"
  on public.habit_challenges for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own habit challenges"
  on public.habit_challenges for update
  using (auth.uid() = user_id);

create policy "Users can delete their own habit challenges"
  on public.habit_challenges for delete
  using (auth.uid() = user_id);

-- Index for faster lookups
create index idx_habit_challenges_user_status on public.habit_challenges(user_id, status);
