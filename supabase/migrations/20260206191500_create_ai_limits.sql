-- Create app_config table for remote settings
create table if not exists public.app_config (
  key text primary key,
  value text not null
);

-- Insert default free limit (can be changed in dashboard)
insert into public.app_config (key, value) values ('free_daily_limit', '5') on conflict do nothing;

-- Create user_daily_usage to track AI messages
create table if not exists public.user_daily_usage (
  user_id uuid references auth.users not null,
  usage_date date default current_date,
  message_count int default 0,
  primary key (user_id, usage_date)
);

-- RLS
alter table public.app_config enable row level security;
alter table public.user_daily_usage enable row level security;

-- Policies
create policy "Read config" on public.app_config for select to authenticated using (true);

create policy "Users manage own usage" on public.user_daily_usage
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
