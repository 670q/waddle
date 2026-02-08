-- Create the habits table
create table public.habits (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null default auth.uid(),
  title text not null,
  icon text not null default 'star',
  time text not null default 'Anytime',
  streak integer not null default 0,
  completed boolean not null default false,
  frequency integer[] null,
  created_at timestamp with time zone not null default now(),
  constraint habits_pkey primary key (id),
  constraint habits_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
);

-- Enable Row Level Security
alter table public.habits enable row level security;

-- Create Policies
create policy "Users can view their own habits" on public.habits
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own habits" on public.habits
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own habits" on public.habits
  for update
  using (auth.uid() = user_id);

create policy "Users can delete their own habits" on public.habits
  for delete
  using (auth.uid() = user_id);
