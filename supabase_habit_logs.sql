-- Create habit_logs table for tracking history
create table if not exists habit_logs (
    id uuid default gen_random_uuid() primary key,
    habit_id uuid references habits(id) on delete cascade not null,
    user_id uuid references auth.users(id) not null,
    completed_at date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(habit_id, completed_at)
);

-- RLS Policies
alter table habit_logs enable row level security;

create policy "Users can read their own logs"
  on habit_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own logs"
  on habit_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own logs"
  on habit_logs for delete
  using (auth.uid() = user_id);
