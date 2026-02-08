-- Create challenges table
create table public.challenges (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  title text not null,
  description text not null,
  type text not null check (type in ('daily', 'weekly')),
  image_url text null,
  bg_color text null,
  start_date date not null default CURRENT_DATE,
  end_date date not null,
  is_active boolean not null default true,
  constraint challenges_pkey primary key (id)
);

-- Enable RLS
alter table public.challenges enable row level security;

-- Create Policy: Everyone can read active challenges
create policy "Public can view active challenges" on public.challenges
  for select
  using (true);

-- Create Policy: Only authenticated users can insert (optional, for admin app later)
-- For now, we assume admin usage via Supabase Dashboard
