-- 1. Create 'habits' table if it doesn't exist
create table if not exists habits (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    title text not null,
    icon text default 'star',
    time text default 'Anytime', -- Morning, Afternoon, Evening, Anytime
    frequency int[] default '{0,1,2,3,4,5,6}', -- Array of day indexes
    streak int default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    -- We keep 'completed' for legacy/simple compat, but 'habit_logs' is the source of truth now
    completed boolean default false 
);

-- RLS for habits
alter table habits enable row level security;

create policy "Users can manage their own habits"
  on habits for all
  using (auth.uid() = user_id);


-- 2. Create 'habit_logs' table for tracking history (The Fix)
create table if not exists habit_logs (
    id uuid default gen_random_uuid() primary key,
    habit_id uuid references habits(id) on delete cascade not null,
    user_id uuid references auth.users(id) not null,
    completed_at date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(habit_id, completed_at)
);

-- RLS for habit_logs
alter table habit_logs enable row level security;

create policy "Users can manage their own logs"
  on habit_logs for all
  using (auth.uid() = user_id);

-- 3. Create 'challenges' table (Optional, for future use)
create table if not exists challenges (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text,
    type text check (type in ('daily', 'weekly')),
    start_date date,
    end_date date,
    bg_color text,
    image_url text,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for challenges (Public Read)
alter table challenges enable row level security;

create policy "Public read access for challenges"
  on challenges for select
  to authenticated
  using (true);
